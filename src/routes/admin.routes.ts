import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import {
    getStats,
    getRevenue,
    cancelShowtime,
    getAllBookings, cancelBooking,
    getAllUsers, toggleUserStatus,
    getRooms, toggleSeatStatus,
} from '../controllers/AdminController';

const router = Router();

router.use(adminAuth);

router.get('/stats', getStats);
router.get('/revenue', getRevenue);

router.patch('/showtimes/:id/cancel', cancelShowtime);

router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/cancel', cancelBooking);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);

router.get('/rooms', getRooms);
router.patch('/seats/:id/status', toggleSeatStatus);

export default router;
