import type { NextFunction, Request, Response } from 'express';
import { ApiKeyAuthenticationError } from 'fet-errors';
import { makeLogger } from 'fet-logger';
import config from '../config';

const log = makeLogger(module);

export function authenticateApiKey(req: Request, _: Response, next: NextFunction): void {
    const requestKey = req.headers.authorization ?? '(none provided)';

    if (requestKey === `apikey ${config.apiKey}`) {
        return next();
    }

    log.error(`Invalid api key: ${requestKey}`);
    throw new ApiKeyAuthenticationError();
}
