import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@fet/api-types';

export type JwtPayload = User;

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
});
