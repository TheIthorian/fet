import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@Controller('api/me/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
    constructor(private readonly service: IntegrationsService) {}

    @Get()
    findAll(@CurrentUser() user: JwtPayload) {
        return this.service.findAllForUser(user.sub);
    }

    @Post(':integrationName')
    generate(@CurrentUser() user: JwtPayload, @Param('integrationName') integrationName: string) {
        return this.service.generateApiKey(user.sub, integrationName);
    }
}
