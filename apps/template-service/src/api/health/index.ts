import expressPromiseRouter from 'express-promise-router';
import type { Request, Response, Handler } from 'express';

export default function initHealthRoutes(): Handler {
    return expressPromiseRouter().get('/health', getHealthHandler);
}

function getHealthHandler(_: Request, res: Response): void {
    res.status(200);
    res.send('ok');
}
