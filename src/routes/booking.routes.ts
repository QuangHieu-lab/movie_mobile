import { Router } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { sequelize } from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { Booking, BookingSeat, BookingSnack, Seat, Showtime, Snack } from '../models';
import type { PaymentMethod } from '../models/Booking';

const router = Router();

const seatPriceMultiplier = (type: string): number => {
    if (type === 'VIP') {
        return 1.25;
    }

    if (type === 'COUPLE') {
        return 2;
    }

    return 1;
};

router.use(authMiddleware);

router.get('/me', async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { user_id: req.userId },
            include: [BookingSeat, BookingSnack],
            order: [['created_at', 'DESC']],
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load bookings', error });
    }
});

router.post('/', async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.userId;
        const {
            showtime_id,
            seat_ids,
            snacks = [],
            payment_method,
        }: {
            showtime_id?: number;
            seat_ids?: number[];
            snacks?: Array<{ snack_id: number; quantity: number }>;
            payment_method?: PaymentMethod;
        } = req.body;

        if (!userId || !showtime_id || !Array.isArray(seat_ids) || seat_ids.length === 0 || !payment_method) {
            await transaction.rollback();
            res.status(400).json({ message: 'showtime_id, seat_ids, and payment_method are required' });
            return;
        }

        const showtime = await Showtime.findByPk(showtime_id, { transaction });
        if (!showtime) {
            await transaction.rollback();
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }

        const uniqueSeatIds = [...new Set(seat_ids)];
        if (uniqueSeatIds.length !== seat_ids.length) {
            await transaction.rollback();
            res.status(400).json({ message: 'seat_ids contains duplicated values' });
            return;
        }

        const seats = await Seat.findAll({
            where: { seat_id: uniqueSeatIds, room_id: showtime.room_id, physical_status: 'ACTIVE' },
            transaction,
        });

        if (seats.length !== uniqueSeatIds.length) {
            await transaction.rollback();
            res.status(400).json({ message: 'Some seats are invalid, inactive, or not in this showtime room' });
            return;
        }

        const basePrice = Number(showtime.price);
        const seatItems = seats.map((seat) => ({
            seat_id: seat.seat_id,
            price: Number((basePrice * seatPriceMultiplier(seat.type)).toFixed(2)),
        }));

        let snackTotal = 0;
        const snackItems: Array<{ snack_id: number; quantity: number; price_at_purchase: number }> = [];

        for (const item of snacks) {
            if (!item.snack_id || !item.quantity || item.quantity < 1) {
                await transaction.rollback();
                res.status(400).json({ message: 'Each snack must include snack_id and quantity greater than 0' });
                return;
            }

            const snack = await Snack.findByPk(item.snack_id, { transaction });
            if (!snack || snack.status !== 'AVAILABLE') {
                await transaction.rollback();
                res.status(400).json({ message: `Snack ${item.snack_id} is unavailable` });
                return;
            }

            const priceAtPurchase = Number(snack.price);
            snackTotal += priceAtPurchase * item.quantity;
            snackItems.push({
                snack_id: item.snack_id,
                quantity: item.quantity,
                price_at_purchase: priceAtPurchase,
            });
        }

        const seatTotal = seatItems.reduce((sum, item) => sum + item.price, 0);
        const totalAmount = Number((seatTotal + snackTotal).toFixed(2));

        const booking = await Booking.create(
            {
                user_id: userId,
                showtime_id,
                total_amount: totalAmount,
                payment_method,
            },
            { transaction },
        );

        await BookingSeat.bulkCreate(
            seatItems.map((item) => ({
                booking_id: booking.booking_id,
                showtime_id,
                seat_id: item.seat_id,
                price: item.price,
            })),
            { transaction },
        );

        if (snackItems.length > 0) {
            await BookingSnack.bulkCreate(
                snackItems.map((item) => ({
                    booking_id: booking.booking_id,
                    ...item,
                })),
                { transaction },
            );
        }

        await transaction.commit();

        res.status(201).json({
            booking_id: booking.booking_id,
            total_amount: totalAmount,
            payment_status: booking.payment_status,
            booking_status: booking.booking_status,
            seats: seatItems,
            snacks: snackItems,
        });
    } catch (error) {
        await transaction.rollback();

        if (error instanceof UniqueConstraintError) {
            res.status(409).json({ message: 'One or more seats are already booked for this showtime' });
            return;
        }

        res.status(500).json({ message: 'Cannot create booking', error });
    }
});

export default router;
