import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserConfigService } from './user-config.service';
import { UserConfigController } from './user-config.controller';
import { UserConfig, UserConfigSchema } from './schemas/user-config.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserConfig.name, schema: UserConfigSchema }]),
        AuthModule,
    ],
    providers: [UserConfigService],
    controllers: [UserConfigController],
    exports: [UserConfigService],
})
export class UserConfigModule {}
