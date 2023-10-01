import { createServer as createHttpServer } from 'node:http';
import express from 'express';
import { makeLogger } from 'fet-logger';
import config from './config';
import { startup } from './express';

const log = makeLogger(module);

log.info({ config });

export const app = express();
export const server = createHttpServer(app);

startup(app);

setImmediate(() => {
    const port = config.port;
    const host = config.host;
    server.listen(port, host, () => {
        log.info(`App listening on http://${config.host}:${port} in ${app.get('env') as string} mode`);

        log.info(`Current working directory: ${process.cwd()}`);
    });
});

process.on('uncaughtException', (error) => {
    log.fatal('Uncaught exception: ', error);
    log.info('Uncaught exception stack: ', error.stack);
});

process.on('unhandledRejection', (error: Error) => {
    log.fatal('Uncaught exception: ', error);
    log.info('Uncaught exception stack: ', error.stack);
});
