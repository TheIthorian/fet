import { createServer as createHttpServer, type Server } from 'node:http';
import type express from 'express';
import { makeLogger } from 'fet-logger';
import config from './config';

const log = makeLogger(module);

export async function startHttpServer(
    app: express.Express,
    { host, port }: { readonly host: string; readonly port: number }
): Promise<Server> {
    const server = createHttpServer(app);

    await Promise.resolve();
    server.listen(port, host, () => {
        log.info(
            `App listening on http://${config.host}:${port} in ${app.get('env') as string} mode`
        );

        log.info(`Current working directory: ${process.cwd()}`);
    });
    await Promise.resolve();

    process.on('uncaughtException', (error) => {
        log.fatal('Uncaught exception: ', error);
        log.info('Uncaught exception stack: ', error.stack);
    });

    process.on('unhandledRejection', (error: Error) => {
        log.fatal('Uncaught exception: ', error);
        log.info('Uncaught exception stack: ', error.stack);
    });

    return server;
}
