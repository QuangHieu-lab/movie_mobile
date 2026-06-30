import axios from 'axios';
import { createHmac, randomUUID } from 'crypto';
import { Booking, Payment } from '../models';
import type { PaymentMethod } from '../models/Payment';

const requiredEnv = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing ${name} in .env`);
    return value;
};

const momoSignature = (rawSignature: string): string =>
    createHmac('sha256', requiredEnv('MOMO_SECRET_KEY')).update(rawSignature).digest('hex');

export class PaymentService {
    public static async createPayment(bookingId: number, paymentMethod: PaymentMethod) {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            throw new Error('Booking không tồn tại');
        }

        const orderId = `CINE-${bookingId}-${Date.now()}`;
        const amount = Math.round(Number(booking.total_amount));

        const payment = await Payment.create({
            booking_id: bookingId,
            order_id: orderId,
            amount,
            payment_method: paymentMethod,
            payment_status: 'PENDING',
        });

        if (paymentMethod !== 'MOMO') {
            return {
                payment,
                orderId,
                paymentUrl: `https://sandbox.paymentgateway.com/pay?orderId=${orderId}&amount=${amount}`,
            };
        }

        const requestId = `${orderId}-${randomUUID().slice(0, 8)}`;
        const partnerCode = requiredEnv('MOMO_PARTNER_CODE');
        const accessKey = requiredEnv('MOMO_ACCESS_KEY');
        const redirectUrl = requiredEnv('MOMO_REDIRECT_URL');
        const ipnUrl = requiredEnv('MOMO_IPN_URL');
        const requestType = 'captureWallet';
        const orderInfo = `Thanh toán vé CineBook #${bookingId}`;
        const extraData = '';

        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${ipnUrl}`,
            `orderId=${orderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${partnerCode}`,
            `redirectUrl=${redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join('&');

        const payload = {
            partnerCode,
            partnerName: 'CineBook',
            storeId: 'CineBook',
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            requestType,
            autoCapture: true,
            extraData,
            signature: momoSignature(rawSignature),
        };

        const response = await axios.post(requiredEnv('MOMO_API_URL'), payload).catch((error) => {
            const detail = error?.response?.data;
            throw new Error(detail?.message || detail?.localMessage || error.message || 'MoMo request failed');
        });

        const result = response.data;
        await payment.update({
            raw_response_log: result,
            gateway_response_code: result?.resultCode?.toString(),
        });

        if (Number(result?.resultCode) !== 0) {
            throw new Error(result?.message || 'MoMo không tạo được giao dịch');
        }

        return {
            payment,
            orderId,
            payUrl: result.payUrl,
            deeplink: result.deeplink,
            qrCodeUrl: result.qrCodeUrl,
            resultCode: result.resultCode,
            message: result.message,
        };
    }

    public static async processWebhook(webhookData: any) {
        const orderId = webhookData.orderId || webhookData.order_id;
        const resultCode = Number(webhookData.resultCode ?? webhookData.response_code ?? 99);
        const transactionReference = webhookData.transId?.toString() || webhookData.transaction_reference;

        const payment = await Payment.findOne({ where: { order_id: orderId } });
        if (!payment) {
            throw new Error('Không tìm thấy giao dịch');
        }

        if (payment.payment_status !== 'PENDING') {
            return { message: 'Giao dịch này đã được xử lý trước đó' };
        }

        const booking = await Booking.findByPk(payment.booking_id);

        if (resultCode === 0) {
            await payment.update({
                payment_status: 'SUCCESS',
                transaction_reference: transactionReference,
                gateway_response_code: resultCode.toString(),
                raw_response_log: webhookData,
                paid_at: new Date(),
            });

            if (booking) {
                await booking.update({
                    booking_status: 'CONFIRMED' as any,
                    payment_status: 'COMPLETED' as any,
                });
            }
        } else {
            await payment.update({
                payment_status: 'FAILED',
                gateway_response_code: resultCode.toString(),
                raw_response_log: webhookData,
            });

            if (booking) {
                await booking.update({
                    booking_status: 'CANCELLED' as any,
                    payment_status: 'FAILED' as any,
                });
            }
        }

        return { message: 'Xử lý Webhook thành công' };
    }

    public static async getPaymentStatus(orderId: string) {
        const payment = await Payment.findOne({
            where: { order_id: orderId },
            attributes: ['payment_id', 'order_id', 'payment_status', 'amount', 'booking_id'],
        });

        if (!payment) {
            throw new Error('Không tìm thấy giao dịch với mã order_id này');
        }

        const booking = await Booking.findByPk(payment.booking_id, {
            attributes: ['booking_status'],
        });

        return {
            order_id: payment.order_id,
            payment_status: payment.payment_status,
            booking_status: booking?.booking_status || 'UNKNOWN',
        };
    }
}
