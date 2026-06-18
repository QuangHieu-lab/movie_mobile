import bcrypt from 'bcrypt';
import { Router } from 'express';
import { User } from '../models';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { full_name, email, phone, date_of_birth, password } = req.body;

        if (!full_name || !email || !password) {
            res.status(400).json({ message: 'full_name, email, and password are required' });
            return;
        }

        const existed = await User.findOne({ where: { email } });
        if (existed) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create({ full_name, email, phone, date_of_birth, password_hash });
        const token = signToken(user.user_id);

        res.status(201).json({
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Register failed', error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'email and password are required' });
            return;
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        res.json({
            token: signToken(user.user_id),
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

export default router;
