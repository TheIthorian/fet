import { Router } from 'express';
import { authenticateApiKey } from './middleware/auth';
import initHealthRoutes from './api/health';
import initJourneyRoutes from './api/journey/routes';

export function initialiseRoutes(): Router {
    const router = Router();

    router.use('/api/', initHealthRoutes());
    router.use('/api/journey/', initJourneyRoutes());

    router.use('/api/', authenticateApiKey);

    return router;
}
