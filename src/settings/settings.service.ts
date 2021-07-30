import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Settings } from './settings.model';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
    ) {
        this.settingsModel.collection.countDocuments().then(async (res) => {
            if (res === 0) {
                const initialized = await this.insertSettings({
                    _id : '5fe8a719688fb0167cca8fc4',
                    maxAttachmentSize: 8048,
                    defaultNumberOfEmployees: 100,
                    defaultNumberOfEquipments: 100,
                    defaultNumberOfOrganizations: 100,
                });
                if (initialized) {
                    console.log('Settings initialized');
                }
            }
        });
    }

    async insertSettings(body) {
        const newSettings = new this.settingsModel({
            _id: body._id,
            maxAttachmentSize: body.maxAttachmentSize,
            defaultNumberOfEmployees: body.defaultNumberOfEmployees,
            defaultNumberOfEquipments: body.defaultNumberOfEquipments,
            defaultNumberOfOrganizations: body.defaultNumberOfOrganizations,
        });
        const result = await newSettings.save();
        return result;
    }

    async getSetting(settingsId: string) {
        return await this.getSettings(settingsId);
    }

    async updateSettings(id, body): Promise<any> {
        return await this.settingsModel.findByIdAndUpdate(id, body, { new: true });
    }

    private async getSettings(id: string): Promise<Settings> {
        let user;
        try {
            user = await this.settingsModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find user.');
        }
        if (!user) {
            throw new NotFoundException('Could not find user.');
        }
        return user;
    }
}
