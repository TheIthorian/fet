import express from 'express';
import { makeLogger } from 'fet-logger';
import { config } from './config';
import { startup } from './express';
import { startHttpServer } from './server';

const log = makeLogger(module);

log.info({ config });

export const app = express();
startup(app);
export const server = startHttpServer(app, config);
