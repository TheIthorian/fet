// node
import type { Server } from 'node:http';
import { createServer as createHttpServer } from 'node:http';
// lib
import express from 'express';
import bodyParser from 'body-parser';
import expressStatusMonitor from 'express-status-monitor';
//app
import { makeLogger, requestLogger } from 'fet-logger';
import { initialiseRoutes } from './routes';
import config from './config';
import { errorHandler } from './middleware/error-handlers';

const log = makeLogger(module);

log.info({ config });

export function expressApp(port: number): express.Express {
    const app = express();

    app.use(requestLogger());

    app.use(expressStatusMonitor()); // `GET /status` to see stats

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(bodyParser.json());

    app.use(initialiseRoutes());

    app.use(errorHandler());

    app.get('/', (_, res) => res.send('Hello'));

    app.set('port', port);

    return app;
}

export function start(port: number): { app: express.Express; server: Server } {
    const app = expressApp(port);
    const server = createHttpServer(app);
    server.listen(port);

    log.info(`App listening on http://${config.host}:${port}`);
    return { app, server };
}

export async function stop(server: Server): Promise<void> {
    process.stdout.write('Stopping server\n');
    const promise = new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return promise;
}

if (require.main === module) {
    start(config.port);
}
