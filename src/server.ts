import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

dotenv.config();

const app: Application = express();

// Middlewares  
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API Dat ve xem phim dang hoat dong!' });
});

// Khoi dong server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server dang chay tai http://localhost:${PORT}`);
    await connectDB();
});