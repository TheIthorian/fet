import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class InternalAuthGuard implements CanActivate {
    constructor(private readonly config: ConfigService) {}

    canActivate(ctx: ExecutionContext): boolean {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const key = request.headers['x-internal-key'];
        if (key !== this.config.getOrThrow('INTERNAL_KEY')) {
            throw new UnauthorizedException();
        }
        return true;
    }
}
