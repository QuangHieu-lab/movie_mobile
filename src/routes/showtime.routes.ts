import { Op } from 'sequelize';
import { Router } from 'express';
import { BookingSeat, Movie, Room, Seat, Showtime } from '../models';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const movieId = typeof req.query.movie_id === 'string' ? Number(req.query.movie_id) : undefined;
        const where = movieId ? { movie_id: movieId } : undefined;

        const showtimes = await Showtime.findAll({
            where,
            include: [
                { model: Movie },
                { model: Room },
            ],
            order: [['start_time', 'ASC']],
        });

        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load showtimes', error });
    }
});

router.post('/', async (req, res) => {
    try {
        const { movie_id, room_id, start_time, end_time, price } = req.body;

        if (!movie_id || !room_id || !start_time || !end_time || !price) {
            res.status(400).json({ message: 'movie_id, room_id, start_time, end_time, and price are required' });
            return;
        }

        const start = new Date(start_time);
        const end = new Date(end_time);
        if (start >= end) {
            res.status(400).json({ message: 'start_time must be before end_time' });
            return;
        }

        const overlapping = await Showtime.findOne({
            where: {
                room_id,
                start_time: { [Op.lt]: end },
                end_time: { [Op.gt]: start },
            },
        });

        if (overlapping) {
            res.status(409).json({ message: 'Room already has a showtime in this time range' });
            return;
        }

        const showtime = await Showtime.create({ movie_id, room_id, start_time: start, end_time: end, price });
        res.status(201).json(showtime);
    } catch (error) {
        res.status(500).json({ message: 'Cannot create showtime', error });
    }
});

router.get('/:showtimeId/seats', async (req, res) => {
    try {
        const showtimeId = Number(req.params.showtimeId);
        const showtime = await Showtime.findByPk(showtimeId);

        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }

        const [seats, bookedSeats] = await Promise.all([
            Seat.findAll({
                where: { room_id: showtime.room_id },
                order: [
                    ['row_name', 'ASC'],
                    ['seat_number', 'ASC'],
                ],
            }),
            BookingSeat.findAll({ where: { showtime_id: showtimeId } }),
        ]);

        const bookedSeatIds = new Set(bookedSeats.map((seat) => seat.seat_id));
        res.json(
            seats.map((seat) => ({
                seat_id: seat.seat_id,
                row_name: seat.row_name,
                seat_number: seat.seat_number,
                type: seat.type,
                physical_status: seat.physical_status,
                booking_status: bookedSeatIds.has(seat.seat_id) ? 'BOOKED' : 'AVAILABLE',
            })),
        );
    } catch (error) {
        res.status(500).json({ message: 'Cannot load seats', error });
    }
});

export default router;
