import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        private jwtService: JwtService,
      ) {}

    async signIn(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password, email } = authCredentialsDto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new this.userModel({ username, password: hashedPassword, email: email });

        try {
            await user.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('User already exists');
            }
            throw error;
        }
    }

    async validateUser(username: string, pass: string): Promise<User> {
        const user = await this.userModel.findOne({ username });

        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);

        if (valid) {
            return user;
        }

        return null;
    }
}
