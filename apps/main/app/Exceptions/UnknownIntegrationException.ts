import { Exception } from '@adonisjs/core/build/standalone';

export default class UnknownIntegrationException extends Exception {
    public static new(name: string) {
        return new UnknownIntegrationException(
            `'${name}' is not a valid integration`,
            400,
            'E_UNKNOWN_INTEGRATION'
        );
    }
}
