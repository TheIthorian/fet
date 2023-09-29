import { AppException } from './AppException';

export default class EmailAlreadyExistsException extends AppException {
    public static new(email: string) {
        return new EmailAlreadyExistsException(`The email '${email}' already exists`, 400, 'E_EMAIL_ALREADY_EXISTS');
    }
}
