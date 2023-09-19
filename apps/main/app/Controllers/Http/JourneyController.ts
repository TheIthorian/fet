import { schema } from '@ioc:Adonis/Core/Validator';
import { Journey, makeClient } from 'fet-journey-service-client';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { journeyService as journeyServiceConfig } from 'Config/services';
import { logContext, makeLogger } from 'fet-logger';

const journeyServiceClient = makeClient(journeyServiceConfig.url, journeyServiceConfig.apiKey);

const log = makeLogger(module);

export default class JourneyController {
    private static initialJourney: Journey | null = null;
    private static serviceKeys: Array<{ userId: number; apiKey: string }> = [
        { userId: 1, apiKey: 'internal_key' },
    ];

    // TODO - Create auth handler which uses stored apiKeys
    public async updateDistance({ request, response }: HttpContextContract) {
        // Should use basic so can be used from IOT clients
        // or use apikey / token for working on their behalf
        const ctx = logContext(`${JourneyController.name}.${this.updateDistance.name}`);

        console.log(request.body());
        console.log(request.headers());

        const authHeader = request.header('authorization') ?? '';
        const headers = {
            apikey: request.header('apikey'),
            limitU: request.header('x-limit-u'),
            authDecoded:
                authHeader &&
                Buffer.from(authHeader?.split('Basic ')[1] ?? '', 'base64')
                    .toString()
                    .split(':')[0],
            authRaw: authHeader,
            needsDecoding: /^Basic/.test(authHeader),
        };
        console.log(headers);

        let userId: number;
        try {
            userId = this.getUserIdFromKey(
                (headers.needsDecoding ? headers.authDecoded : headers.authRaw) ||
                    headers.apikey ||
                    headers.limitU ||
                    ''
            );
        } catch (e) {
            console.log(e);
            console.log('Defaulting to userId of 1');
            userId = 1;
        }

        const journeyUpdateSchema = schema.create({
            lat: schema.number(),
            lon: schema.number(),
        });
        const journeyUpdateData = await request.validate({ schema: journeyUpdateSchema });

        if (!JourneyController.initialJourney) {
            const { journey } = await journeyServiceClient.create({ userId });
            JourneyController.initialJourney = journey;

            log.info(`${ctx} - Initial journey created with id ${journey.id}`);
        }

        log.info(`${ctx} - updating distance`, journeyUpdateData);
        const { distance } = await journeyServiceClient.updateDistance({
            userId,
            journeyId: JourneyController.initialJourney.id,
            coordinates: {
                lat: journeyUpdateData.lat,
                long: journeyUpdateData.lon,
            },
        });

        log.info(`${ctx} - new distance: ${distance}`);

        response.status(200).json({});
    }

    private getUserIdFromKey(apiKey: string) {
        const ctx = logContext(`${JourneyController.name}.${this.getUserIdFromKey.name}`, {
            apiKey,
        });

        const userId = JourneyController.serviceKeys.find((k) => k.apiKey === apiKey)?.userId;
        log.info(`${ctx} - apiKey: ${apiKey}, userId: ${userId}`);

        if (!userId) {
            log.error(`${ctx} - no user found`);
            throw new Error('Invalid api key provided: ' + apiKey);
        }

        return userId;
    }
}
