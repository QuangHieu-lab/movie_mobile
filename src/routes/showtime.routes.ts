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

router.get('/:showtimeId', async (req, res) => {
    try {
        const showtime = await Showtime.findByPk(Number(req.params.showtimeId), {
            include: [
                { model: Movie },
                { model: Room },
            ],
        });

        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }

        res.json(showtime);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load showtime', error });
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

router.put('/:showtimeId', async (req, res) => {
    try {
        const showtime = await Showtime.findByPk(Number(req.params.showtimeId));
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }

        const next = {
            movie_id: req.body.movie_id ?? showtime.movie_id,
            room_id: req.body.room_id ?? showtime.room_id,
            start_time: req.body.start_time ? new Date(req.body.start_time) : showtime.start_time,
            end_time: req.body.end_time ? new Date(req.body.end_time) : showtime.end_time,
            price: req.body.price ?? showtime.price,
        };

        if (next.start_time >= next.end_time) {
            res.status(400).json({ message: 'start_time must be before end_time' });
            return;
        }

        const overlapping = await Showtime.findOne({
            where: {
                showtime_id: { [Op.ne]: showtime.showtime_id },
                room_id: next.room_id,
                start_time: { [Op.lt]: next.end_time },
                end_time: { [Op.gt]: next.start_time },
            },
        });

        if (overlapping) {
            res.status(409).json({ message: 'Room already has a showtime in this time range' });
            return;
        }

        await showtime.update(next);
        res.json(showtime);
    } catch (error) {
        res.status(500).json({ message: 'Cannot update showtime', error });
    }
});

router.delete('/:showtimeId', async (req, res) => {
    try {
        const showtime = await Showtime.findByPk(Number(req.params.showtimeId));
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }

        await showtime.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Cannot delete showtime', error });
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
