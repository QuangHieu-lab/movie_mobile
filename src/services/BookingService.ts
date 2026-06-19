import { UniqueConstraintError } from 'sequelize';
import { sequelize } from '../config/database';
import { Booking, BookingSeat, BookingSnack, Movie, Seat, Showtime, Snack, User } from '../models';
import type { PaymentMethod } from '../models/Booking';

const seatPriceMultiplier = (type: string): number => {
    if (type === 'VIP') {
        return 1.25;
    }

    if (type === 'COUPLE') {
        return 2;
    }

    return 1;
};

const calculateAge = (dob: Date, referenceDate: Date): number => {
    let age = referenceDate.getFullYear() - dob.getFullYear();
    const m = referenceDate.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

export class BookingService {
    static async getMyBookings(userId: number) {
        return await Booking.findAll({
            where: { user_id: userId },
            include: [BookingSeat, BookingSnack],
            order: [['created_at', 'DESC']],
        });
    }

    static async createBooking(
        userId: number,
        showtimeId: number,
        seatIds: number[],
        snacks: Array<{ snack_id: number; quantity: number }>,
        paymentMethod: PaymentMethod
    ) {
        const transaction = await sequelize.transaction();

        try {
            const showtime = await Showtime.findByPk(showtimeId, { transaction });
            if (!showtime) {
                throw new Error('Showtime not found');
            }

            const movie = await Movie.findByPk(showtime.movie_id, { transaction });
            const user = await User.findByPk(userId, { transaction });

            if (!movie || !user) {
                throw new Error('Movie or User not found');
            }

            // Age check
            if (movie.age_restriction && movie.age_restriction > 0) {
                if (!user.date_of_birth) {
                    throw new Error('User date of birth is required for this movie');
                }
                const dob = new Date(user.date_of_birth);
                const showtimeDate = new Date(showtime.start_time);
                const age = calculateAge(dob, showtimeDate);
                if (age < movie.age_restriction) {
                    throw new Error(`You must be at least ${movie.age_restriction} years old to book this movie`);
                }
            }

            const uniqueSeatIds = [...new Set(seatIds)];
            if (uniqueSeatIds.length !== seatIds.length) {
                throw new Error('seat_ids contains duplicated values');
            }

            const seats = await Seat.findAll({
                where: { seat_id: uniqueSeatIds, room_id: showtime.room_id, physical_status: 'ACTIVE' },
                transaction,
            });

            if (seats.length !== uniqueSeatIds.length) {
                throw new Error('Some seats are invalid, inactive, or not in this showtime room');
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
                    throw new Error('Each snack must include snack_id and quantity greater than 0');
                }

                const snack = await Snack.findByPk(item.snack_id, { transaction });
                if (!snack || snack.status !== 'AVAILABLE') {
                    throw new Error(`Snack ${item.snack_id} is unavailable`);
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
                    showtime_id: showtimeId,
                    total_amount: totalAmount,
                    payment_method: paymentMethod,
                },
                { transaction },
            );

            await BookingSeat.bulkCreate(
                seatItems.map((item) => ({
                    booking_id: booking.booking_id,
                    showtime_id: showtimeId,
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

            return {
                booking_id: booking.booking_id,
                total_amount: totalAmount,
                payment_status: booking.payment_status,
                booking_status: booking.booking_status,
                seats: seatItems,
                snacks: snackItems,
            };
        } catch (error) {
            await transaction.rollback();
            if (error instanceof UniqueConstraintError) {
                throw new Error('One or more seats are already booked for this showtime');
            }
            throw error;
        }
    }
}
