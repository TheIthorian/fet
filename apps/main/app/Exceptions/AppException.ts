import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { Exception } from '@adonisjs/core/build/standalone';

export class AppException extends Exception {
    public async handle(error: this, ctx: HttpContextContract) {
        ctx.response.status(error.status).send({
            code: error.code,
            message: error.message,
        });
    }
}
