import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';

@Controller('api/vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
    constructor(private readonly service: VehiclesService) {}

    @Get()
    findAll(@CurrentUser() user: JwtPayload) {
        return this.service.findAll(user.sub);
    }

    @Post()
    create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVehicleDto) {
        return this.service.create(user.sub, dto);
    }
}
