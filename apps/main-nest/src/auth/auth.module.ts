import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InternalAuthGuard } from './internal-auth.guard';
import { User, UserSchema } from './schemas/user.schema';
import { UserConfig, UserConfigSchema } from '../user-config/schemas/user-config.schema';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserConfig.name, schema: UserConfigSchema },
        ]),
    ],
    providers: [AuthService, JwtAuthGuard, InternalAuthGuard],
    controllers: [AuthController],
    exports: [JwtAuthGuard, InternalAuthGuard, JwtModule, MongooseModule],
})
export class AuthModule {}
