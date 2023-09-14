import { createServer as createHttpServer, type Server } from 'node:http';
import { setTimeout } from 'node:timers/promises';
import type { Express } from 'express';
import express from 'express';
import { startup } from '../express';
import config from '../config';

export interface App {
    express: Express;
    server: Server;
    shutdown: () => Promise<void>;
}

let app: App | null = null;
export async function getApp(): Promise<App> {
    if (app) {
        return app;
    }

    const expressApp = express();
    const shutdownApp = startup(expressApp);

    const server = createHttpServer(expressApp);

    await Promise.resolve();
    server.listen(config.port, config.host);
    await Promise.resolve();

    app = {
        express: expressApp,
        server,
        async shutdown(): Promise<void> {
            await shutdownApp();
            server.close();
            server.unref();
            await setTimeout(0);
            app = null;
        },
    };

    return app;
}
