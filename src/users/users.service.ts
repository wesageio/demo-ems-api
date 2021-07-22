import * as bcrypt from 'bcryptjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Users } from './users.model';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('Users') private readonly usersModel: Model<Users>,
    ) {
        this.usersModel.collection.countDocuments().then(async (res) => {
            if (res === 0) {
                const initialized = await this.insertUser({
                    username: 'admin',
                    email: 'admin@example.com',
                    password: bcrypt.hashSync('admin', 8),
                    role: ['admin'],
                });
                if (initialized) {
                    console.log('User initialized');
                }
            }
        });
    }

    async insertUser(body) {
        const newUser = new this.usersModel({
            username: body.username,
            email: body.email,
            password: body.password,
            role: body.role,
        });
        const result = await newUser.save();
        return result;
    }

    async findByUsername(username: string) {
        return await this.usersModel.findOne({ username }).exec();
    }

    async getUsers(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const filterData = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.usersModel.find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData).exec();
        const count = await this.usersModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getUser(userId: string) {
        return await this.findUser(userId);
    }

    async updateUser(id, body): Promise<any> {
        let bodyData = body;
        if (bodyData.hasOwnProperty('newPassword')) {
            bodyData = {
                password: bcrypt.hashSync(bodyData.newPassword, 8),
            };
        }
        return await this.usersModel.findByIdAndUpdate(id, bodyData, { new: true });
    }

    async deleteUser(userId: string) {
        return await this.usersModel.deleteOne({ _id: userId }).exec();
    }

    async deleteUsers(userIds): Promise<any> {
        const { ids } = userIds;
        return await this.usersModel.deleteMany({ _id: { $in: ids } });
    }

    private async findUser(id: string): Promise<Users> {
        let user;
        try {
            user = await this.usersModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find user.');
        }
        if (!user) {
            throw new NotFoundException('Could not find user.');
        }
        return user;
    }
}
