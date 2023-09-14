export class AppError<T extends object | undefined = undefined> extends Error {
    name: string;
    data: T | undefined;

    status = 500;
    logError = false;

    constructor(message: string, name: string, opts: { data?: T; details?: string } = {}) {
        super(message);
        this.data = opts.data;
        this.name = name;
    }

    toJson() {
        return {
            message: this.message,
            name: this.name,
            ...this.data,
        };
    }
}

export class ResourceNotFoundError extends AppError<object> {
    status = 404;
    constructor(message: string, data: object = {}) {
        super(message, ResourceNotFoundError.name, { data });
    }
}

export class UnableToCreateResourceError extends AppError<object> {
    status = 500;
    constructor(details: string, data: object = {}) {
        super('Unable to create resource', UnableToCreateResourceError.name, { data, details });
    }
}

export class NotImplementedError extends AppError<object> {
    status = 501;
    constructor(message: string) {
        super(message, NotImplementedError.name);
    }
}

export class AuthenticationError extends AppError<object> {
    status = 401;
    constructor(cause: string) {
        super('Unable to authenticate user', AuthenticationError.name, { data: { cause } });
    }

    // Don't return why the authentication failed
    toJson() {
        return { message: this.message, name: this.name };
    }
}

export class ApiKeyAuthenticationError extends AppError<{}> {
    status = 401;
    constructor() {
        super('Invalid api key', ApiKeyAuthenticationError.name, {});
    }
}

export class TokenError extends AppError<object> {
    status = 401;
    constructor(cause: string) {
        super('Unable to verify token', TokenError.name, { data: { cause } });
    }
}

export class HttpCalloutError extends AppError<object> {
    status = 500;
    constructor(body: any) {
        super('Error calling service', HttpCalloutError.name, { data: { body } });
    }
}

export class SchemaValidationError extends AppError<object> {
    status = 400;
    constructor(type: string, validationError: any) {
        super('Invalid request: ', SchemaValidationError.name, { data: { type, validationError } });
    }
}
