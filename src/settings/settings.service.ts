import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Settings } from './settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
    ) {
        this.settingsRepository.count().then(async (res) => {
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
        const newSettings = this.settingsRepository.create({
            id: body._id,
            maxAttachmentSize: body.maxAttachmentSize,
            defaultNumberOfEmployees: body.defaultNumberOfEmployees,
            defaultNumberOfEquipments: body.defaultNumberOfEquipments,
            defaultNumberOfOrganizations: body.defaultNumberOfOrganizations,
        });
        const result = await this.settingsRepository.save(newSettings);
        return result;
    }

    async getSetting(settingsId: string) {
        return await this.getSettings(settingsId);
    }

    async updateSettings(id, body): Promise<any> {
        return await this.settingsRepository.update(
            { id: id },
            body,
        );
    }

    private async getSettings(id: string): Promise<Settings> {
        let settings;
        try {
            settings = await this.settingsRepository.findOne({id: id});
        } catch (error) {
            throw new NotFoundException('Could not find settings.');
        }
        if (!settings) {
            throw new NotFoundException('Could not find settings.');
        }
        return settings;
    }
}
