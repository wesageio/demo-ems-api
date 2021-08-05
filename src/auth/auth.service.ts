import { Injectable, NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as moment from 'moment-timezone';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Users } from './schemas/users.enity';
import { ObjectID } from 'bson';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
        private jwtService: JwtService,
    ) {
        this.userRepository.count().then(async (res) => {
            if (res === 0) {
                const userInitialized = await this.signUp({
                    username: 'admin',
                    email: 'admin@example.com',
                    password: 'adminadmin',
                    lastActivity: new Date(),
                });
                if (userInitialized) {
                    console.log('User initialized');
                }
            }
        });
    }

    async signIn(user: any) {
        const payload = { username: user.username, sub: user.id };
        const bodyData = {
            lastActivity: new Date(moment.tz('Asia/Yerevan').format('YYYY/MM/DD HH:mm:ss')),
        };

        await this.userRepository.update(
            { id: user.id },
            bodyData,
        );
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

        return await this.userRepository.update(
            { id: new ObjectID(id) },
            bodyData,
        );
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<any> {
        const { username, password, email, lastActivity } = authCredentialsDto;
        const checkUserExistence = await this.getUser(username);

        if (checkUserExistence) {
            throw new NotAcceptableException(
                'Another user with provided username already exists.',
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({ username, password: hashedPassword, email, lastActivity });
        return await this.userRepository.save(newUser);
    }

    async validateUser(username: string, pass: string): Promise<Users> {
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);
        if (valid) {
            return user;
        }

        return null;
    }

    async getUser(username: string) {
        return await this.userRepository.findOne({ username });
    }
}
