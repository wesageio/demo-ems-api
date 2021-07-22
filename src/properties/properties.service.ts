import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Properties } from './properties.model';
import { filterForQuery, writeData } from '../utils/utils';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectModel('Properties') private readonly propertiesModel: Model<Properties>,
    ) {
        // this.proeprtiesModel.collection.countDocuments().then(async (res) => {
        //     if (res === 0) {
        //         const initialized = await this.insertRule({
        //             keyword: 'example',
        //             category: 'FROM',
        //             isIgnore: true,
        //             isActive: false,
        //         });
        //         if (initialized) {
        //             console.log('Rule initialized');
        //         }
        //     }
        // });
    }

    async insertServer(body) {
        const modifiedAttachments = await writeData(body.attachments);
        const data = Object.assign({}, body, { attachments: modifiedAttachments ? modifiedAttachments : body.attachments });
        const newServer = new this.propertiesModel({
            name: body.name,
            category: body.category,
            description: body.description,
            purchaseDate: body.purchaseDate,
            purchaseCost: body.purchaseCost,
            warranty: body.warranty,
            status: body.status,
            attachments: data.attachments,
        });
        const result = await newServer.save();
        return result;
    }

    async getServers(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.propertiesModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData).exec();
        const count = await this.propertiesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getManyServers(filter: any) {
        const data = await this.propertiesModel
            .find({ _id: { $in: filter.id }})
            .exec();
        const count = await this.propertiesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getServer(serverId: string) {
        const server = await this.findServer(serverId);
        return { server };
    }

    async updateServer(id, body): Promise<any> {
        const modifiedAttachments = await writeData(body.attachments);
        const data = Object.assign({}, body, { attachments: modifiedAttachments ? modifiedAttachments : body.attachments });
        return await this.propertiesModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteServer(serverId: string) {
        return await this.propertiesModel.deleteOne({ _id: serverId }).exec();
    }

    async deleteServers(serverIds): Promise<any> {
        const { ids } = serverIds;
        return await this.propertiesModel.deleteMany({ _id: { $in: ids } });
    }

    private async findServer(id: string): Promise<Properties> {
        let server;
        try {
            server = await this.propertiesModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find server.');
        }
        if (!server) {
            throw new NotFoundException('Could not find server.');
        }
        return server;
    }
}
