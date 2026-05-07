import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OdometerService } from './odometer.service';
import { OdometerController } from './odometer.controller';
import { OdometerReading, OdometerReadingSchema } from './schemas/odometer-reading.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: OdometerReading.name, schema: OdometerReadingSchema }]),
        AuthModule,
    ],
    providers: [OdometerService],
    controllers: [OdometerController],
})
export class OdometerModule {}
