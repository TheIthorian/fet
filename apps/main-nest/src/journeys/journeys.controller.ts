import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@Controller()
export class JourneysController {
    constructor(private readonly service: JourneysService) {}

    @Get('api/journeys')
    @UseGuards(JwtAuthGuard)
    findAll(@CurrentUser() user: JwtPayload) {
        return this.service.findAll(user.sub);
    }

    @Post('iapi/journey')
    @HttpCode(201)
    @UseGuards(InternalAuthGuard)
    create(@Body() dto: CreateJourneyDto) {
        return this.service.create(dto);
    }
}
