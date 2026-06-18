import { Router } from 'express';
import { Movie, Showtime } from '../models';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const where = status ? { status } : undefined;
        const movies = await Movie.findAll({ where, order: [['created_at', 'DESC']] });

        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load movies', error });
    }
});

router.post('/', async (req, res) => {
    try {
        const { api_movie_id, title, status, duration_minutes, age_restriction } = req.body;

        if (!api_movie_id || !title) {
            res.status(400).json({ message: 'api_movie_id and title are required' });
            return;
        }

        const movie = await Movie.create({ api_movie_id, title, status, duration_minutes, age_restriction });
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Cannot create movie', error });
    }
});

router.get('/:movieId/showtimes', async (req, res) => {
    try {
        const showtimes = await Showtime.findAll({
            where: { movie_id: Number(req.params.movieId) },
            order: [['start_time', 'ASC']],
        });

        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ message: 'Cannot load showtimes', error });
    }
});

export default router;
