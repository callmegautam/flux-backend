import { decodeToken, verifyToken } from '@/utils/jwt';
import { Response, Request, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.authorization || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
        const decoded = verifyToken(token);
        res.locals.data = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }
};

export const authMiddlewareWithRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.authorization || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
        const decoded = verifyToken(token);
        if (typeof decoded !== 'object' || !('role' in decoded) || decoded.role !== role) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
        }

        if (decoded.role != role) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to perform this action',
                data: null,
            });
        }

        res.locals.data = decoded;

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }
};
