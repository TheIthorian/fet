import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(ctx: ExecutionContext): boolean {
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        const token = this.extractToken(request);
        if (!token) throw new UnauthorizedException();

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (request as any).user = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractToken(request: FastifyRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
