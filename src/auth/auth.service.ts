import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Users, UsersDocument } from './schemas/users.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
        private jwtService: JwtService,
    ) {
        this.usersModel.collection.countDocuments().then(async (res) => {
            if (res === 0) {
                const userInitialized = await this.signUp({
                    username: 'admin',
                    email: 'admin@example.com',
                    password: 'adminadmin',
                });
                if (userInitialized) {
                    console.log('User initialized');
                }
            }
        });
    }

    async signIn(user: any) {
        const payload = { username: user.username, sub: user._id };
        const bodyData = {
            lastAcitivy: new Date(moment.tz('Asia/Yerevan').format('YYYY/MM/DD HH:mm:ss')),
        };
        await this.usersModel.findByIdAndUpdate(user._id, bodyData, { new: true });
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async updateUser(id, body): Promise<any> {
        let bodyData = body;
        if (bodyData.hasOwnProperty('newPassword')) {
            bodyData = {
                password: await bcrypt.hash(bodyData.newPassword, 10),
            };
        }
        return await this.usersModel.findByIdAndUpdate(id, bodyData, { new: true });
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<any> {
        const { username, password, email } = authCredentialsDto;

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const isExist = await this.getUser(username);
            if (isExist) {
                return false;
            } else {
                const user = new this.usersModel({ username, password: hashedPassword, email: email });
                const newUser = await user.save();
                return newUser;
            }
        } catch (error) {
            throw error;
        }
    }

    async validateUser(username: string, pass: string): Promise<Users> {
        const user = await this.usersModel.findOne({ username });

        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);

        if (valid) {
            return user;
        }

        return null;
    }

    async getUser(userName: string) {
        return await this.usersModel.findOne({ username: userName }).exec();
    }
}
