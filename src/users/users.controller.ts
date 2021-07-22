import * as bcrypt from 'bcryptjs';
import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    BadRequestException,
    Query,
    Res,
    Put,
    NotFoundException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { Users } from './users.model';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('signup')
    async createUser(
        @Body() UsersBody: Users,
    ) {
        UsersBody.password = bcrypt.hashSync(UsersBody.password, 8);
        const generatedId = await this.usersService.insertUser(UsersBody);
        return { id: generatedId };
    }

    @Post()
    async addUser(
        @Res() res,
        @Body() UsersBody: Users,
    ) {
        UsersBody.password = bcrypt.hashSync(UsersBody.password, 8);
        const data = await this.usersService.insertUser(UsersBody);
        return res.status(200).json({
            message: 'User has been successfully created',
            data,
        });
    }

    @Post('signin')
    async signIn(
        @Body('username') username: string,
        @Body('password') password: string,
    ) {
        const user = await this.usersService.findByUsername(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            return { user };
        }
        throw new BadRequestException('Invalid credentials');
    }

    @Get()
    async getAllUsers(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        const users = await this.usersService.getUsers(filter, limit, page, orderBy, orderDir);
        return users;
    }

    @Get(':id')
    getUser(@Param('id') userId: string) {
        return this.usersService.getUser(userId);
    }

    @Put(':id')
    async updateUser(
        @Res() res,
        @Param('id') id: string,
        @Body() UsersBody: Users,
    ) {
        const updated = await this.usersService.updateUser(id, UsersBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'User has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeUser(
        @Res() res,
        @Param('id') userId: string,
    ) {
        const deletedUser = await this.usersService.deleteUser(userId);
        if (!deletedUser) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'User has been successfully deleted',
            deletedUser,
        });
    }

    @Delete()
    async removeUsers(
        @Res() res,
        @Body() ids,
    ) {
        const deletedUsers = await this.usersService.deleteUsers(ids);
        if (!deletedUsers) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Users has been successfully deleted',
            deletedUsers,
        });
    }
}
