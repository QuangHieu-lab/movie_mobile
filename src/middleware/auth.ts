import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ message: 'Missing authentication token' });
        return;
    }

    try {
        const payload = verifyToken(token);
        req.userId = payload.userId;
        next();
    } catch (_error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
