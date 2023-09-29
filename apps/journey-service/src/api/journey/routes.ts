import expressPromiseRouter from 'express-promise-router';
import type { Request, Handler } from 'express';
import {
    CreateJourneyParamSchema,
    EndJourneyBodySchema,
    EndJourneyParamsSchema,
    GetJourneyParamsSchema,
    PostLocationBodySchema,
    PostLocationParamsSchema,
    UpdateDistanceBodySchema,
    UpdateDistanceParamsSchema,
} from 'fet-journey-service-client';
import type {
    GetJourneyInput,
    Journey,
    CreateJourneyInput,
    UpdateDistanceParamsInput,
    UpdateDistanceBodyInput,
    EndJourneyBodyInput,
    EndJourneyParamsInput,
    PostLocationBodyInput,
    PostLocationParamsInput,
} from 'fet-journey-service-client';
import { BodySchemaValidator, ParamSchemaValidator } from 'fet-object-schema';
import type { ParsedBodyResponse, ParsedParamsResponse } from 'fet-object-schema';
import { MicroserviceClient } from 'fet-http';
import config from '../../config';
import { JourneyLogService } from '../service/journey-log-service';
import { JourneyApi } from './api';
import { MemoryDatabase } from './database';
import { JourneyStateApi } from './state-api';
import type { CompletedJourney, InProgressJourney, NewJourney } from './types';

export const database = new MemoryDatabase<Journey>();
export const journeyApi = new JourneyApi(database);

const journeyLogMsClient = new MicroserviceClient(config.mainApp.url, config.mainApp.apiKey);
export const journeyStateApi = new JourneyStateApi(
    new MemoryDatabase<NewJourney | InProgressJourney | CompletedJourney>(),
    new JourneyLogService(journeyLogMsClient)
);

type H = Handler[];
export default function initJourneyRoutes(): Handler {
    return expressPromiseRouter({ mergeParams: true })
        .get('/journey/:journeyId', [ParamSchemaValidator(GetJourneyParamsSchema), getJourneyHandler] as H)
        .post('/journey', [ParamSchemaValidator(CreateJourneyParamSchema), postJourneyHandler] as H)
        .post('/journey/:journeyId/location', [
            ParamSchemaValidator(UpdateDistanceParamsSchema),
            BodySchemaValidator(UpdateDistanceBodySchema),
            postJourneyLocationHandler,
        ] as H)
        .post('/journey/:journeyId/end', [
            ParamSchemaValidator(EndJourneyParamsSchema),
            BodySchemaValidator(EndJourneyBodySchema),
            postJourneyEndHandler,
        ] as H)
        .post('/location', [
            ParamSchemaValidator(PostLocationParamsSchema),
            BodySchemaValidator(PostLocationBodySchema),
            postLocationHandler,
        ] as H);
}

async function getJourneyHandler(_: Request, res: ParsedParamsResponse<GetJourneyInput>): Promise<void> {
    const { userId, journeyId } = res.locals.parsedParams;
    const journey = await journeyApi.get({ userId, journeyId });

    res.status(200);
    res.json(journey);
}

async function postJourneyHandler(_: Request, res: ParsedParamsResponse<CreateJourneyInput>): Promise<void> {
    const { userId } = res.locals.parsedParams;

    const journey = await journeyApi.create({ userId });

    res.status(200);
    res.json(journey);
}

async function postJourneyLocationHandler(
    _: Request,
    res: ParsedParamsResponse<UpdateDistanceParamsInput> & ParsedBodyResponse<UpdateDistanceBodyInput>
): Promise<void> {
    const { coordinates } = res.locals.parsedBody;
    const { userId, journeyId } = res.locals.parsedParams;

    const distance = await journeyApi.updateDistance({ userId, coordinates, journeyId });

    res.status(200);
    res.json(distance);
}

async function postJourneyEndHandler(
    _: Request,
    res: ParsedBodyResponse<EndJourneyBodyInput> & ParsedParamsResponse<EndJourneyParamsInput>
): Promise<void> {
    const { carId } = res.locals.parsedBody;
    const { userId, journeyId } = res.locals.parsedParams;

    const journey = await journeyApi.endJourney({ userId, carId, journeyId });

    res.status(200);
    res.json(journey);
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
