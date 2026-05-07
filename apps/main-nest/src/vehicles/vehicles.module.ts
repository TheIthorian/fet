import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
        AuthModule,
    ],
    providers: [VehiclesService],
    controllers: [VehiclesController],
    exports: [VehiclesService],
})
export class VehiclesModule {}
