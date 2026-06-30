import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
    
    // API dành cho Flutter App gọi lên để lấy link thanh toán
    public static async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId, paymentMethod } = req.body;

            if (!bookingId || !paymentMethod) {
                res.status(400).json({ error: 'Thiếu thông tin bookingId hoặc paymentMethod' });
                return;
            }

            const result = await PaymentService.createPayment(Number(bookingId), paymentMethod);
            
            res.status(200).json({
                message: 'Khởi tạo thanh toán thành công',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // API Webhook dành cho VNPAY/MoMo gọi ngầm về Backend
    public static async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            // MoMo can send data through body for IPN, while browser returns use query params.
            const webhookData = { ...req.query, ...req.body };

            await PaymentService.processWebhook(webhookData);

            // Cổng thanh toán luôn yêu cầu trả về HTTP Status 200 (hoặc JSON format chuẩn của họ) để xác nhận đã nhận được IPN
            res.status(200).json({ message: 'Success', RspCode: '00' }); 
        } catch (error: any) {
            console.error('Lỗi xử lý Webhook:', error);
            // Một số cổng yêu cầu trả về mã lỗi cụ thể nếu IPN lỗi
            res.status(500).json({ message: 'Internal Server Error', RspCode: '99' });
        }
    }

    public static async handleReturn(req: Request, res: Response): Promise<void> {
        try {
            await PaymentService.processWebhook(req.query);
            res.status(200).send('CineBook đã ghi nhận kết quả thanh toán. Bạn có thể quay lại ứng dụng.');
        } catch (error: any) {
            console.error('Lỗi xử lý MoMo return:', error);
            res.status(500).send('Không xử lý được kết quả thanh toán. Vui lòng quay lại ứng dụng để kiểm tra.');
        }
    }

    public static async getPaymentStatus(req: Request, res: Response): Promise<void> {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                res.status(400).json({ error: 'Thiếu mã orderId' });
                return;
            }

            const statusData = await PaymentService.getPaymentStatus(orderId as string);
            
            res.status(200).json({
                message: 'Lấy trạng thái thành công',
                data: statusData
            });
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }
}
