import { Body, Controller, HttpCode, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JourneyService } from './journey.service';
import { PostLocationDto } from './dto/post-location.dto';
import type { FastifyRequest } from 'fastify';
import { Req } from '@nestjs/common';

@Controller('api/users/:userId')
export class JourneyController {
    constructor(
        private readonly service: JourneyService,
        private readonly config: ConfigService,
    ) {}

    @Post('location')
    @HttpCode(200)
    async postLocation(
        @Req() req: FastifyRequest,
        @Param('userId') userId: string,
        @Body() body: Omit<PostLocationDto, 'userId'>,
    ) {
        const key = req.headers['x-api-key'];
        if (key !== this.config.getOrThrow('INTERNAL_KEY')) {
            throw new UnauthorizedException();
        }

        const journey = await this.service.handlePostLocation({ ...body, userId });
        return journey ? { journey } : {};
    }
}
