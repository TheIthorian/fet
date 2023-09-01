import { Router } from 'express';
import { authenticateApiKey } from './middleware/auth';
import initHealthRoutes from './api/health';

export function initialiseRoutes(): Router {
    const router = Router();

    router.use('/api/', authenticateApiKey);
    router.use('/api/', initHealthRoutes());

    return router;
}
