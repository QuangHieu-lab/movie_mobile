import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// Endpoint tạo thanh toán (Yêu cầu Authentication từ user)
// Ví dụ: POST /api/payments/create
router.post('/create', PaymentController.createPayment);

// Endpoint Webhook (KHÔNG dùng Middleware Authentication vì ví điện tử gọi trực tiếp)
// Ví dụ: POST /api/payments/webhook
router.post('/webhook', PaymentController.handleWebhook);
router.get('/status/:orderId', PaymentController.getPaymentStatus);
export default router;