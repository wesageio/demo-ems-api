import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersSchema } from './schemas/users.model';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: 'User', schema: UsersSchema }]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '2h' },
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})

export class AuthModule { }
