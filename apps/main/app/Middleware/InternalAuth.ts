import Logger from '@ioc:Adonis/Core/Logger';
import { AuthenticationException } from '@adonisjs/auth/build/standalone';
import Env from '@ioc:Adonis/Core/Env';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class InternalAuth {
    public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
        const internalApiKey = 'apikey ' + Env.get('INTERNAL_KEY');

        const requestKey = request.header('authorization');
        if (!(internalApiKey === requestKey)) {
            Logger.error(
                `Internal call failed api key validation. Expected '${internalApiKey}', received '${requestKey}'`
            );
            throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS');
        }

        await next();
    }
}
