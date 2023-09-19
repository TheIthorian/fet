import Env from '@ioc:Adonis/Core/Env';

export const journeyService = {
    url: Env.get('JOURNEY_SERVICE_URL'),
    apiKey: Env.get('JOURNEY_SERVICE_API_KEY'),
};
