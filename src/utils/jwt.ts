import jwt, { SignOptions } from 'jsonwebtoken';

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Missing JWT_SECRET in .env');
    return secret;
};

export const signToken = (userId: number, role: 'USER' | 'ADMIN'): string => {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    };
    return jwt.sign({ userId, role }, getJwtSecret(), options);
};

export const verifyToken = (token: string): { userId: number; role: 'USER' | 'ADMIN' } => {
    return jwt.verify(token, getJwtSecret()) as { userId: number; role: 'USER' | 'ADMIN' };
};
