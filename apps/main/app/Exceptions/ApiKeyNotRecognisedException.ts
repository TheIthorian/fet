import { AppException } from './AppException';

export default class ApiKeyNotRecognisedException extends AppException {
    public static new(integrationName: string) {
        return new ApiKeyNotRecognisedException(
            `The api key provided for ${integrationName} is not recognised`,
            401,
            'E_API_KEY_NOT_RECOGNISED'
        );
    }
}
