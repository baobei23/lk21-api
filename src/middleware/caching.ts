import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';

export const cacheMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
        return res.json(cachedData);
    }

    const oldJson = res.json;
    res.json = (data) => {
        cache.set(key, data);
        return oldJson.call(res, data);
    };

    next();
};
