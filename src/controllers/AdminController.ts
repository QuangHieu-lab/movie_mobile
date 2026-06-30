import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Booking, BookingSeat, BookingSnack, Movie, Payment, Room, Seat, Showtime, Snack, User } from '../models';
import { sequelize } from '../config/database';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
            totalUsers,
            totalMovies,
            activeMovies,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            todayBookings,
            totalRevenue,
            todayRevenue,
            revenueByDay,
            ticketsByMovie,
            recentBookings,
        ] = await Promise.all([
            User.count({ where: { role: 'USER' } }),
            Movie.count(),
            Movie.count({ where: { status: 'NOW_SHOWING' } }),
            Booking.count(),
            Booking.count({ where: { booking_status: 'RESERVED' } }),
            Booking.count({ where: { booking_status: 'CONFIRMED' } }),
            Booking.count({ where: { created_at: { [Op.between]: [today, todayEnd] } } }),
            Booking.sum('total_amount', { where: { booking_status: { [Op.ne]: 'CANCELLED' } } }),
            Booking.sum('total_amount', {
                where: { booking_status: { [Op.ne]: 'CANCELLED' }, created_at: { [Op.between]: [today, todayEnd] } },
            }),
            // Revenue last 7 days (from Bookings)
            sequelize.query(`
                SELECT DATE(created_at) as date, SUM(total_amount) as revenue
                FROM Bookings
                WHERE booking_status != 'CANCELLED'
                  AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `, { type: 'SELECT' }),
            // Tickets sold by movie
            sequelize.query(`
                SELECT m.title, COUNT(bs.booking_seat_id) as tickets
                FROM Booking_Seats bs
                JOIN Showtimes s ON s.showtime_id = bs.showtime_id
                JOIN Movies m ON m.movie_id = s.movie_id
                JOIN Bookings b ON b.booking_id = bs.booking_id
                WHERE b.booking_status != 'CANCELLED'
                GROUP BY m.movie_id, m.title
                ORDER BY tickets DESC
                LIMIT 5
            `, { type: 'SELECT' }),
            // Recent bookings
            Booking.findAll({
                limit: 8,
                order: [['created_at', 'DESC']],
                include: [
                    { model: User, attributes: ['full_name', 'email'] },
                    {
                        model: Showtime,
                        attributes: ['start_time'],
                        include: [{ model: Movie, attributes: ['title'] }],
                    },
                ],
            }),
        ]);

        res.json({
            overview: {
                totalUsers,
                totalMovies,
                activeMovies,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                todayBookings,
                totalRevenue: Number(totalRevenue) || 0,
                todayRevenue: Number(todayRevenue) || 0,
            },
            revenueByDay,
            ticketsByMovie,
            recentBookings,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error });
    }
};

// ─── Revenue Report ───────────────────────────────────────────────────────────

export const getRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { period = 'month' } = req.query;
        const now = new Date();
        const year  = Math.max(2020, Math.min(2100, Number(req.query.year)    || now.getFullYear()));
        const month = Math.max(1,    Math.min(12,   Number(req.query.month)   || (now.getMonth() + 1)));
        const qtr   = Math.max(1,    Math.min(4,    Number(req.query.quarter) || Math.ceil((now.getMonth() + 1) / 3)));

        let periodFilter: string;
        let prevFilter: string;
        let periodLabel: string;

        if (period === 'quarter') {
            const sm = (qtr - 1) * 3 + 1, em = sm + 2;
            const pq = qtr === 1 ? 4 : qtr - 1, py = qtr === 1 ? year - 1 : year;
            const psm = (pq - 1) * 3 + 1, pem = psm + 2;
            periodFilter = `YEAR(b.created_at) = ${year} AND MONTH(b.created_at) BETWEEN ${sm} AND ${em}`;
            prevFilter   = `YEAR(b.created_at) = ${py}   AND MONTH(b.created_at) BETWEEN ${psm} AND ${pem}`;
            periodLabel  = `Q${qtr}/${year}`;
        } else if (period === 'year') {
            periodFilter = `YEAR(b.created_at) = ${year}`;
            prevFilter   = `YEAR(b.created_at) = ${year - 1}`;
            periodLabel  = `${year}`;
        } else {
            const pm = month === 1 ? 12 : month - 1, py = month === 1 ? year - 1 : year;
            periodFilter = `YEAR(b.created_at) = ${year} AND MONTH(b.created_at) = ${month}`;
            prevFilter   = `YEAR(b.created_at) = ${py}   AND MONTH(b.created_at) = ${pm}`;
            periodLabel  = `T${month}/${year}`;
        }

        const nc = `b.booking_status != 'CANCELLED'`;

        const [curr, prev, ticketRev, snackRev, chart, topMovies] = await Promise.all([
            sequelize.query(`
                SELECT COALESCE(SUM(b.total_amount),0) AS total_revenue,
                       COUNT(DISTINCT b.booking_id)    AS booking_count
                FROM Bookings b WHERE ${nc} AND ${periodFilter}
            `, { type: 'SELECT' }),
            sequelize.query(`
                SELECT COALESCE(SUM(b.total_amount),0) AS total_revenue
                FROM Bookings b WHERE ${nc} AND ${prevFilter}
            `, { type: 'SELECT' }),
            sequelize.query(`
                SELECT COALESCE(SUM(bs.price),0) AS ticket_revenue
                FROM Bookings b
                JOIN Booking_Seats bs ON bs.booking_id = b.booking_id
                WHERE ${nc} AND ${periodFilter}
            `, { type: 'SELECT' }),
            sequelize.query(`
                SELECT COALESCE(SUM(bsn.price_at_purchase * bsn.quantity),0) AS snack_revenue
                FROM Bookings b
                JOIN Booking_Snacks bsn ON bsn.booking_id = b.booking_id
                WHERE ${nc} AND ${periodFilter}
            `, { type: 'SELECT' }),
            sequelize.query(`
                SELECT YEAR(created_at)  AS year,
                       MONTH(created_at) AS month,
                       COALESCE(SUM(total_amount),0) AS revenue,
                       COUNT(*)          AS bookings
                FROM Bookings
                WHERE booking_status != 'CANCELLED'
                  AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year, month
            `, { type: 'SELECT' }),
            sequelize.query(`
                SELECT m.title,
                       COUNT(DISTINCT b.booking_id)    AS bookings,
                       COALESCE(SUM(b.total_amount),0) AS revenue
                FROM Bookings b
                JOIN Showtimes s ON s.showtime_id = b.showtime_id
                JOIN Movies m    ON m.movie_id    = s.movie_id
                WHERE ${nc} AND ${periodFilter}
                GROUP BY m.movie_id, m.title
                ORDER BY revenue DESC
                LIMIT 5
            `, { type: 'SELECT' }),
        ]);

        const c = (curr[0] as any) ?? {};
        const p = (prev[0] as any) ?? {};
        const totalRevenue = Number(c.total_revenue) || 0;
        const prevRevenue  = Number(p.total_revenue) || 0;
        const changePercent = prevRevenue > 0
            ? Number(((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1))
            : 0;

        res.json({
            period: periodLabel,
            totalRevenue,
            prevRevenue,
            changePercent,
            bookingCount: Number(c.booking_count) || 0,
            ticketRevenue: Number((ticketRev[0] as any)?.ticket_revenue) || 0,
            snackRevenue:  Number((snackRev[0] as any)?.snack_revenue)  || 0,
            byMonth: chart,
            topMovies,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch revenue', error });
    }
};

// ─── Showtimes ────────────────────────────────────────────────────────────────

export const cancelShowtime = async (req: Request, res: Response): Promise<void> => {
    try {
        const showtime = await Showtime.findByPk(Number(req.params.id));
        if (!showtime) { res.status(404).json({ message: 'Showtime not found' }); return; }

        const [affected] = await Booking.update(
            { booking_status: 'CANCELLED', payment_status: 'REFUNDED' },
            { where: { showtime_id: showtime.showtime_id, booking_status: { [Op.ne]: 'CANCELLED' } } },
        );

        res.json({ message: `Đã hủy suất chiếu, ${affected} booking bị ảnh hưởng`, affected });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel showtime', error });
    }
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, page = 1, limit = 20, date_range } = req.query;
        const where: Record<string, unknown> = {};
        if (status) where.booking_status = status;

        if (date_range) {
            const now = new Date();
            if (date_range === 'today') {
                const start = new Date(now); start.setHours(0, 0, 0, 0);
                const end   = new Date(now); end.setHours(23, 59, 59, 999);
                where.created_at = { [Op.between]: [start, end] };
            } else if (date_range === 'week') {
                const start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0);
                where.created_at = { [Op.gte]: start };
            } else if (date_range === 'month') {
                where.created_at = { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) };
            }
        }

        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await Booking.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: User, attributes: ['full_name', 'email', 'phone'] },
                {
                    model: Showtime,
                    attributes: ['start_time', 'end_time', 'price'],
                    include: [
                        { model: Movie, attributes: ['title', 'poster_url'] },
                        { model: Room, attributes: ['name'] },
                    ],
                },
                {
                    model: BookingSeat,
                    include: [{ model: Seat, attributes: ['row_name', 'seat_number', 'type'] }],
                },
                { model: BookingSnack, include: [{ model: Snack, attributes: ['name'] }] },
            ],
        });

        res.json({
            bookings: rows,
            total: count,
            totalPages: Math.ceil(count / Number(limit)),
            page: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error });
    }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findByPk(Number(req.params.id));
        if (!booking) { res.status(404).json({ message: 'Booking not found' }); return; }
        if (booking.booking_status === 'CANCELLED') { res.status(400).json({ message: 'Already cancelled' }); return; }

        await booking.update({ booking_status: 'CANCELLED', payment_status: 'REFUNDED' });
        await Payment.update({ payment_status: 'REFUNDED' }, { where: { booking_id: booking.booking_id } });

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel booking', error });
    }
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where: Record<string, unknown> = {};
        if (status) where.payment_status = status;

        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await Booking.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: User, attributes: ['full_name', 'email'] },
                {
                    model: Showtime,
                    attributes: ['start_time', 'price'],
                    include: [{ model: Movie, attributes: ['title'] }],
                },
            ],
        });

        // Map Booking fields to payment-like structure for FE
        const payments = rows.map((b: any) => ({
            payment_id: b.booking_id,
            booking_id: b.booking_id,
            amount: b.total_amount,
            payment_method: b.payment_method,
            payment_status: b.payment_status,
            paid_at: b.created_at,
            created_at: b.created_at,
            Booking: {
                booking_id: b.booking_id,
                User: b.User,
                Showtime: b.Showtime,
            },
        }));

        res.json({
            payments,
            total: count,
            totalPages: Math.ceil(count / Number(limit)),
            page: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payments', error });
    }
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const where: Record<string, unknown> = { role: 'USER' };
        if (search) {
            where[Op.or as unknown as string] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows } = await User.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']],
        });

        res.json({
            users: rows,
            total: count,
            totalPages: Math.ceil(count / Number(limit)),
            page: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByPk(Number(req.params.id));
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }

        await user.update({ is_active: !user.is_active });
        res.json({ message: `User ${user.is_active ? 'activated' : 'deactivated'}`, is_active: user.is_active });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user status', error });
    }
};

// ─── Rooms & Seats ────────────────────────────────────────────────────────────

export const getRooms = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await Room.findAll({
            include: [{
                model: Seat,
                attributes: ['seat_id', 'row_name', 'seat_number', 'type', 'physical_status'],
            }],
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rooms', error });
    }
};

export const toggleSeatStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const seat = await Seat.findByPk(Number(req.params.id));
        if (!seat) { res.status(404).json({ message: 'Seat not found' }); return; }

        const newStatus = seat.physical_status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
        await seat.update({ physical_status: newStatus });
        res.json({ message: `Seat set to ${newStatus}`, physical_status: newStatus });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update seat status', error });
    }
};
