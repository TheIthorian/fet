import { AppException } from './AppException';

export default class UnknownIntegrationException extends AppException {
    public static new(name: string) {
        return new UnknownIntegrationException(`'${name}' is not a valid integration`, 400, 'E_UNKNOWN_INTEGRATION');
    }
}
