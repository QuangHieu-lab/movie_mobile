import { Payment, Booking } from '../models'; // Import từ file index.ts của bạn
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, PaymentStatus } from '../models/Payment';

export class PaymentService {
    
    // 1. Khởi tạo thanh toán và trả về Payment URL
    public static async createPayment(bookingId: number, paymentMethod: PaymentMethod) {
        // Lấy thông tin booking để biết số tiền cần thanh toán
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            throw new Error('Booking không tồn tại');
        }

        // Tạo mã đơn hàng duy nhất để gửi sang cổng thanh toán
        const orderId = `INV-${Date.now()}-${uuidv4().substring(0, 6)}`;
        
        // Giả sử Booking có thuộc tính total_amount
        const amount = (booking as any).total_amount; 

        // Tạo bản ghi Payment với trạng thái PENDING
        const payment = await Payment.create({
            booking_id: bookingId,
            order_id: orderId,
            amount: amount,
            payment_method: paymentMethod,
            payment_status: 'PENDING'
        });

        // Tích hợp SDK Cổng thanh toán tại đây (VNPAY, MOMO...)
        // Ví dụ: const paymentUrl = await MomoSDK.createPaymentLink({ orderId, amount, ... })
        const mockPaymentUrl = `https://sandbox.paymentgateway.com/pay?orderId=${orderId}&amount=${amount}`;

        return {
            payment,
            paymentUrl: mockPaymentUrl
        };
    }

    // 2. Xử lý Webhook (IPN) từ cổng thanh toán gọi về
    public static async processWebhook(webhookData: any) {
        // Trong thực tế, bạn phải verify Signature/Checksum tại bước này
        // if (!verifySignature(webhookData)) throw new Error('Invalid Signature');

        const { order_id, transaction_reference, response_code, is_success } = webhookData;

        // Tìm giao dịch dựa trên order_id
        const payment = await Payment.findOne({ where: { order_id } });
        if (!payment) {
            throw new Error('Không tìm thấy giao dịch');
        }

        if (payment.payment_status !== 'PENDING') {
            return { message: 'Giao dịch này đã được xử lý trước đó' };
        }

        const booking = await Booking.findByPk(payment.booking_id);

        if (is_success) {
            // Cập nhật Payment thành SUCCESS
            await payment.update({
                payment_status: 'SUCCESS',
                transaction_reference: transaction_reference,
                gateway_response_code: response_code,
                raw_response_log: webhookData,
                paid_at: new Date()
            });

            // Xác nhận Booking
            if (booking) {
                await booking.update({ booking_status: 'CONFIRMED' as any });
            }
        } else {
            // Cập nhật Payment thành FAILED
            await payment.update({
                payment_status: 'FAILED',
                gateway_response_code: response_code,
                raw_response_log: webhookData
            });

            // Hủy Booking, giải phóng ghế
            if (booking) {
                await booking.update({ booking_status: 'CANCELLED' as any });
            }
        }

        return { message: 'Xử lý Webhook thành công' };
    }
    public static async getPaymentStatus(orderId: string) {
        const payment = await Payment.findOne({ 
            where: { order_id: orderId },
            attributes: ['payment_id', 'order_id', 'payment_status', 'amount', 'booking_id'] // Chỉ lấy các trường cần thiết
        });

        if (!payment) {
            throw new Error('Không tìm thấy giao dịch với mã order_id này');
        }

        // Lấy thêm trạng thái của Booking để App Flutter biết vé đã được confirm chưa
        const booking = await Booking.findByPk(payment.booking_id, {
            attributes: ['booking_status']
        });

        return {
            order_id: payment.order_id,
            payment_status: payment.payment_status, // Trạng thái thanh toán (PENDING, SUCCESS, FAILED...)
            booking_status: booking?.booking_status || 'UNKNOWN' // Trạng thái vé (RESERVED, CONFIRMED, CANCELLED)
        };
    }
}