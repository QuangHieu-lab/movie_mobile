import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { BookingController } from '../controllers/BookingController';

const router = Router();

router.use(authMiddleware);

router.get('/me', BookingController.getMyBookings);
router.post('/', BookingController.createBooking);

export default router;
