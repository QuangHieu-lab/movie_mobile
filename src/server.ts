import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/database';
import './models';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import showtimeRoutes from './routes/showtime.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import snackRoutes from './routes/snack.routes';
import adminRoutes from './routes/admin.routes';
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'movie_mobile_api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/snacks', snackRoutes);
app.use('/api/admin', adminRoutes);
const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        if (process.env.DB_SYNC === 'true') {
            await sequelize.sync({ alter: true });
            console.log('Đồng bộ models với database thành công!');
        }

        app.listen(port, () => {
            console.log(`Server đang chạy tại http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Không thể khởi động server:', error);
        process.exit(1);
    }
};

void startServer();
