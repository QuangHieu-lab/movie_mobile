import jwt, { SignOptions } from 'jsonwebtoken';

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('Missing JWT_SECRET in .env');
    }

    return secret;
};

export const signToken = (userId: number): string => {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    };

    return jwt.sign({ userId }, getJwtSecret(), options);
};

export const verifyToken = (token: string): { userId: number } => {
    return jwt.verify(token, getJwtSecret()) as { userId: number };
};
