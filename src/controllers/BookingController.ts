import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';

export class BookingController {
    static async getMyBookings(req: Request, res: Response): Promise<void> {
        try {
            const bookings = await BookingService.getMyBookings(req.userId!);
            res.json(bookings);
        } catch (error: any) {
            res.status(500).json({ message: 'Cannot load bookings', error: error.message });
        }
    }

    static async createBooking(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { showtime_id, seat_ids, snacks = [], payment_method } = req.body;

            if (!showtime_id || !Array.isArray(seat_ids) || seat_ids.length === 0 || !payment_method) {
                res.status(400).json({ message: 'showtime_id, seat_ids, and payment_method are required' });
                return;
            }

            const bookingResult = await BookingService.createBooking(
                userId,
                showtime_id,
                seat_ids,
                snacks,
                payment_method
            );

            res.status(201).json(bookingResult);
        } catch (error: any) {
            const message = error.message;
            if (message.includes('already booked')) {
                res.status(409).json({ message });
            } else if (message.includes('required for this movie') || message.includes('least')) {
                res.status(403).json({ message });
            } else if (message.includes('not found') || message.includes('invalid') || message.includes('unavailable') || message.includes('duplicated')) {
                res.status(400).json({ message });
            } else {
                res.status(500).json({ message: 'Cannot create booking', error: message });
            }
        }
    }
}
