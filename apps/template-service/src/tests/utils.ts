import { setTimeout } from 'node:timers/promises';
import type { Express } from 'express';
import express from 'express';
import { startup } from '../express';

export interface App {
    express: Express;
    shutdown: () => Promise<void>;
}

let app: App | null = null;
export function getApp(): App {
    if (app) {
        return app;
    }

    const expressApp = express();
    const shutdownApp = startup(expressApp);

    app = {
        express: expressApp,
        async shutdown(): Promise<void> {
            await setTimeout(0);
            await shutdownApp();
            app = null;
        },
    };

    return app;
}
