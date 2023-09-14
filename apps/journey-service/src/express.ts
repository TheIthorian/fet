// lib
import type { Express } from 'express';
import bodyParser from 'body-parser';
import expressStatusMonitor from 'express-status-monitor';
//app
import { requestLogger } from 'fet-logger';
import { initialiseRoutes } from './routes';
import { errorHandler } from './middleware/error-handlers';

export function initExpressApp(app: Express): Express {
    app.use(requestLogger());

    app.use(expressStatusMonitor()); // `GET /status` to see stats

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(bodyParser.json());

    app.use(initialiseRoutes());

    app.use(errorHandler());

    app.get('/', (_, res) => res.send('Hello'));

    return app;
}

export function startup(app: Express): () => Promise<void> {
    initExpressApp(app);
    return () => Promise.resolve();
}
