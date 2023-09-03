import type { NextFunction, Request, Response } from 'express';
import { AppError } from 'fet-errors';
import { makeLogger } from '../logger';

const log = makeLogger(module);

export function errorHandler() {
    return (error: Error | AppError, _: Request, res: Response, next: NextFunction): void => {
        log.error(error);

        if (error instanceof AppError) {
            if (error.logError) {
                log.error(
                    { name: error.name, message: error.message, data: error.data as object },
                    'AppError'
                );
            }

            res.status(error.status);
            res.json(error.toJson());
            return next();
        }

        res.status(500);
        res.json({ message: 'Internal server error', cause: error.cause, message2: error.message });
        next();
    };
}
