import { Exception } from '@adonisjs/core/build/standalone';

export default class EmailAlreadyExistsException extends Exception {
    public static new(email: string) {
        return new EmailAlreadyExistsException(
            `The email '${email}' already exists`,
            400,
            'E_EMAIL_ALREADY_EXISTS'
        );
    }
}
