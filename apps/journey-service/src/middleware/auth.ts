import type { NextFunction, Request, Response } from 'express';
import { ApiKeyAuthenticationError } from 'fet-errors';
import { makeLogger } from 'fet-logger';

const log = makeLogger(module);

export function authenticateApiKey(req: Request, _: Response, next: NextFunction): void {
    const requestKey = req.headers.api ?? '';

    if (requestKey === 'internal_api') {
        return next();
    }

    log.error(`Invalid api key: ${Array.isArray(requestKey) ? requestKey[0] : requestKey}`);
    throw new ApiKeyAuthenticationError();
}
