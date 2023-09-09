import expressPromiseRouter from 'express-promise-router';
import type { Request, Response, Handler } from 'express';
import type { Coordinates, Journey } from './types';
import { JourneyApi } from './api';
import { MemoryDatabase } from './database';

export const database = new MemoryDatabase<Journey>();
export const journeyApi = new JourneyApi(database);

export default function initJourneyRoutes(): Handler {
    return expressPromiseRouter()
        .get('/:id', [getJourneyHandler])
        .post('/', [postJourneyHandler])
        .post('/:id/position', [postJourneyPositionHandler])
        .post('/:id/end', [postJourneyEndHandler]);
}

// TODO - Add validation

async function getJourneyHandler(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;
    const journeyId = req.params.id;

    const journey = await journeyApi.get(Number(userId), journeyId);
    res.status(200);
    res.json({ journey });
}

async function postJourneyHandler(req: Request, res: Response): Promise<void> {
    const { userId } = req.body as { userId: number };

    const journey = await journeyApi.create(userId);

    res.status(200);
    res.json({ journey });
}

async function postJourneyPositionHandler(req: Request, res: Response): Promise<void> {
    const { userId, newCoordinates } = req.body as unknown as {
        userId: number;
        newCoordinates: Coordinates;
    };
    const journeyId = req.params.id;

    const distance = await journeyApi.updateDistance({ userId, newCoordinates, journeyId });

    res.status(200);
    res.json({ distance });
}

async function postJourneyEndHandler(req: Request, res: Response): Promise<void> {
    const { userId, carId } = req.body as { userId: number; carId: number };
    const journeyId = req.params.id;

    const journey = await journeyApi.endJourney({ userId, carId, journeyId });

    res.status(200);
    res.json({ journey });
}
