import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger';
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';

export default class ExceptionHandler extends HttpExceptionHandler {
    constructor() {
        super(Logger);
    }

    public async handle(error: any, ctx: HttpContextContract) {
        this.logger.warn(error.message);

        if (!error.status || error.status === 500) {
            return super.handle({ message: 'unexpected server error', code: 'UNKNOWN' }, ctx);
        }

        delete error.stack;
        return super.handle(error, ctx);
    }
}
