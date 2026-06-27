declare namespace Express {
    export interface Request {
        userId?: number;
        userRole?: 'USER' | 'ADMIN';
    }
}
