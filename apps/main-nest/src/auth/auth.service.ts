import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import { UserConfig } from '../user-config/schemas/user-config.schema';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(UserConfig.name) private readonly userConfigModel: Model<UserConfig>,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({ email: dto.email });
        if (existing) throw new ConflictException('Email already registered');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userModel.create({ email: dto.email, password: hashed });

        await this.userConfigModel.create({
            userId: user._id,
            displayName: user.email,
            setupRequired: true,
            geolocationEnabled: false,
        });

        const token = this.jwtService.sign({ sub: user._id.toString(), email: user.email });
        return { token, user: { id: user._id, email: user.email } };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({ email: dto.email }).select('+password');
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        const token = this.jwtService.sign({ sub: user._id.toString(), email: user.email });
        return { token, user: { id: user._id, email: user.email } };
    }
}
