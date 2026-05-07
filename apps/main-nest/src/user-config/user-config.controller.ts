import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserConfigService } from './user-config.service';
import { UpdateUserConfigDto } from './dto/update-user-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@Controller('api/me/config')
@UseGuards(JwtAuthGuard)
export class UserConfigController {
    constructor(private readonly service: UserConfigService) {}

    @Get()
    get(@CurrentUser() user: JwtPayload) {
        return this.service.findByUserId(user.sub);
    }

    @Post()
    upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserConfigDto) {
        return this.service.upsert(user.sub, dto);
    }
}
