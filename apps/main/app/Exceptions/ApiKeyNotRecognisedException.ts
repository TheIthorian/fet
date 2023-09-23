import { Exception } from '@adonisjs/core/build/standalone';

export default class ApiKeyNotRecognisedException extends Exception {
    public static new(integrationName: string) {
        return new ApiKeyNotRecognisedException(
            `The api key provided for ${integrationName} is not recognised`,
            401,
            'E_API_KEY_NOT_RECOGNISED'
        );
    }
}
