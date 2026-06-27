import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ message: 'Missing authentication token' });
        return;
    }

    try {
        const payload = verifyToken(token);
        if (payload.role !== 'ADMIN') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    } catch (_error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
