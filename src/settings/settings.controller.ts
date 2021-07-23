import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Res,
    Put,
    NotFoundException,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import { UsersService } from '../users/users.service';
import { Settings } from './settings.model';

@Controller('settings')
export class SettingsController {
    constructor(
        private readonly settingsService: SettingsService,
        private usersService: UsersService,
    ) { }
    @Post()
    async createSettings(
        @Res() res,
        @Body() SettingsBody: Settings,
    ) {
        const data = await this.settingsService.insertSettings(SettingsBody);
        return res.status(200).json({
            message: 'Settings has been successfully created',
            data,
        });
    }

    @Get(':id')
    getSettings(@Param('id') settingsId: string) {
        return this.settingsService.getSetting(settingsId);
    }

    @Put(':id')
    async updateSettings(
        @Res() res,
        @Param('id') id: string,
        @Body() SettingsBody: any,
    ) {
        const userId = SettingsBody.userId;
        const updated = await this.settingsService.updateSettings(id, SettingsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        if (SettingsBody.hasOwnProperty('newPassword')) {
            await this.usersService.updateUser(userId, SettingsBody);
        }
        return res.status(200).json({
            message: 'Settings has been successfully updated',
            updated,
        });
    }
}
