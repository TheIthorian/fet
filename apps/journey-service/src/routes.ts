import { Router } from 'express';
import { authenticateApiKey } from './middleware/auth';
import initHealthRoutes from './api/health';

export function initialiseRoutes(): Router {
    const router = Router();

    router.use('/api/', initHealthRoutes());

    router.use('/api/', authenticateApiKey);

    return router;
}
