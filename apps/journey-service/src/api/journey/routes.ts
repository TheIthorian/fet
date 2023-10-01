import expressPromiseRouter from 'express-promise-router';
import type { Request, Handler } from 'express';
import { PostLocationBodySchema, PostLocationParamsSchema } from 'fet-journey-service-client';
import type { PostLocationBodyInput, PostLocationParamsInput } from 'fet-journey-service-client';
import { BodySchemaValidator, ParamSchemaValidator } from 'fet-object-schema';
import type { ParsedBodyResponse, ParsedParamsResponse } from 'fet-object-schema';
import { MicroserviceClient } from 'fet-http';
import config from '../../config';
import { JourneyLogService } from '../service/journey-log-service';
import { MemoryDatabase } from './database';
import { JourneyStateApi } from './state-api';
import type { CompletedJourney, InProgressJourney, NewJourney } from './types';

const journeyLogMsClient = new MicroserviceClient(config.mainApp.url, config.mainApp.apiKey);
export const journeyStateApi = new JourneyStateApi(
    new MemoryDatabase<NewJourney | InProgressJourney | CompletedJourney>(),
    new JourneyLogService(journeyLogMsClient)
);

type H = Handler[];
export default function initJourneyRoutes(): Handler {
    return expressPromiseRouter({ mergeParams: true }).post('/location', [
        ParamSchemaValidator(PostLocationParamsSchema),
        BodySchemaValidator(PostLocationBodySchema),
        postLocationHandler,
    ] as H);
}

async function postLocationHandler(
    _: Request,
    res: ParsedBodyResponse<PostLocationBodyInput> & ParsedParamsResponse<PostLocationParamsInput>
): Promise<void> {
    const { userId } = res.locals.parsedParams;
    const { lat, lon, created_at, velocity, distance } = res.locals.parsedBody;

    const journey = await journeyStateApi.handlePostLocation({
        userId,
        lat,
        lon,
        created_at,
        velocity,
        distance,
    });

    res.status(200);
    res.json(journey ? { journey } : {});
}
