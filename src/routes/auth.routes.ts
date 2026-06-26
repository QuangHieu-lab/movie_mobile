import bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { Router } from 'express';
import { EmailOtp, User } from '../models';
import { sendRegistrationOtp } from '../services/mail.service';
import { signToken } from '../utils/jwt';

const router = Router();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const hashOtp = (code: string): string => createHash('sha256').update(code).digest('hex');

router.post('/register/request-otp', async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            res.status(400).json({ message: 'email is required' });
            return;
        }
        if (await User.findOne({ where: { email } })) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }

        const current = await EmailOtp.findOne({ where: { email } });
        if (current?.created_at && Date.now() - current.created_at.getTime() < OTP_RESEND_COOLDOWN_MS) {
            res.status(429).json({ message: 'Please wait before requesting another code' });
            return;
        }

        const code = randomInt(100000, 1000000).toString();
        await sendRegistrationOtp(email, code);
        await EmailOtp.upsert({
            email,
            code_hash: hashOtp(code),
            expires_at: new Date(Date.now() + OTP_TTL_MS),
            attempts: 0,
            created_at: new Date(),
        });
        res.status(201).json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('Could not send registration OTP:', error);
        res.status(500).json({ message: 'Could not send verification email' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { full_name, email, phone, password, date_of_birth, otp } = req.body;

        if (!full_name || !email || !password || !date_of_birth || !otp) {
            res.status(400).json({ message: 'full_name, email, password, date_of_birth, and otp are required' });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existed = await User.findOne({ where: { email: normalizedEmail } });
        if (existed) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }

        const verification = await EmailOtp.findOne({ where: { email: normalizedEmail } });
        if (!verification || verification.expires_at.getTime() < Date.now()) {
            res.status(400).json({ message: 'Verification code has expired. Request a new code.' });
            return;
        }
        if (verification.attempts >= OTP_MAX_ATTEMPTS) {
            res.status(429).json({ message: 'Too many incorrect verification attempts. Request a new code.' });
            return;
        }
        if (verification.code_hash !== hashOtp(String(otp))) {
            await verification.increment('attempts');
            res.status(400).json({ message: 'Invalid verification code' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create({ full_name, email: normalizedEmail, phone, password_hash, date_of_birth });
        await verification.destroy();
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
