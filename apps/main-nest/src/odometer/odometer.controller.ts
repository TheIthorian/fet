import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OdometerService } from './odometer.service';
import { CreateOdometerReadingDto } from './dto/create-odometer-reading.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@Controller('api/vehicles/:vehicleId/odometer')
@UseGuards(JwtAuthGuard)
export class OdometerController {
    constructor(private readonly service: OdometerService) {}

    @Get()
    findAll(@Param('vehicleId') vehicleId: string) {
        return this.service.findAll(vehicleId);
    }

    @Post()
    create(
        @CurrentUser() user: JwtPayload,
        @Param('vehicleId') vehicleId: string,
        @Body() dto: CreateOdometerReadingDto,
    ) {
        return this.service.create(user.sub, vehicleId, dto);
    }
}
