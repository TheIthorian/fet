import Module from 'module';
import { createWriteStream } from 'fs';
import { pino } from 'pino';
import type { NextFunction, Request, Response, Handler } from 'express';

const DEFAULT_LEVEL = 'debug';

interface LogFunction {
    <T extends object>(obj: T, msg?: string, ...args: any[]): void;
    (obj: unknown, msg?: string, ...args: any[]): void;
    (msg: string, ...args: any[]): void;
}

export interface Logger {
    fatal: LogFunction;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
    silent: LogFunction;
}

export function makeLogger(module: Module | undefined, level = DEFAULT_LEVEL): Logger {
    const streams = [
        { stream: process.stdout },
        { stream: createWriteStream('app.log', { flags: 'a' }) },
    ];

    let name = 'unknown';
    if (module?.filename) {
        const modulePath = module.filename?.split('apps')[1]?.split('\\') ?? [];
        const lastPart = [modulePath[modulePath.length - 2], modulePath[modulePath.length - 1]];
        name = `${lastPart.join('/')}`;
        console.log({ name });
    }

    return pino({ level, name }, pino.multistream(streams));
}

const logger = makeLogger(module, DEFAULT_LEVEL);

export function requestLogger(): Handler {
    return function loggerMiddleware(req: Request, _: Response, next: NextFunction): void {
        const { method, url, ip, hostname } = req;
        logger.info({ method, url, ip, hostname }, `[${method}] - ${url}`);
        next();
    };
}

export function logContext(
    functionName: string,
    dataObject: Record<string, string | null | number | Date> = {},
    log?: Logger
) {
    const objectString = Object.entries(dataObject)
        .map(([key, value]) => `[${key} : ${value?.toString()}]`)
        .join(', ');

    const delimiter = objectString ? ' - ' : '';
    const ctx = `${functionName}${delimiter}${objectString}`;

    log?.info(ctx);

    return ctx;
}
