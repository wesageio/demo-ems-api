import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Properties } from './properties.model';
import { filterForQuery } from '../utils/utils';
import { IFileManager } from '../common/fileManager/IFileManager.interface';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectModel('Properties') private readonly propertiesModel: Model<Properties>,
        private fileManager: IFileManager,
    ) { }

    async insertProeprty(body) {
        const modifiedAttachments = await this.fileManager.insertFile(body.attachments);
        const data = Object.assign({}, body, { attachments: modifiedAttachments ? modifiedAttachments : body.attachments });
        const newProperty = new this.propertiesModel({
            name: body.name,
            category: body.category,
            description: body.description,
            purchaseDate: body.purchaseDate,
            purchaseCost: body.purchaseCost,
            warranty: body.warranty,
            status: body.status,
            attachments: data.attachments,
        });
        const result = await newProperty.save();
        return result;
    }

    async getProperties(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
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

        const dataWithS3 = await this.getS3Paths(data);
        data.attachments = dataWithS3;
        const count = await this.propertiesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getManyProperties(filter: any) {
        const data = await this.propertiesModel
            .find({ _id: { $in: filter.id }})
            .exec();

        const dataWithS3 = await this.getS3Paths(data);
        data.attachments = dataWithS3;
        const count = await this.propertiesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getProperty(propertyId: string) {
        const property = await this.findProperty(propertyId);
        const attachments = await this.fileManager.getFiles(property.attachments);
        property.attachments = attachments;
        return { property };
    }

    async updateProperty(id, body): Promise<any> {
        const modifiedAttachments = await this.fileManager.insertFile(body.attachments);
        if (modifiedAttachments) {
            body = Object.assign({}, body, { attachments: modifiedAttachments });
        }
        return await this.propertiesModel.findByIdAndUpdate(id, body, { new: true });
    }

    async deleteProperty(propertyId: string) {
        return await this.propertiesModel.deleteOne({ _id: propertyId }).exec();
    }

    async deleteProperties(propertyIds): Promise<any> {
        const { ids } = propertyIds;
        return await this.propertiesModel.deleteMany({ _id: { $in: ids } });
    }

    private async findProperty(id: string): Promise<Properties> {
        let property;
        try {
            property = await this.propertiesModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find property.');
        }
        if (!property) {
            throw new NotFoundException('Could not find property.');
        }
        return property;
    }

    private async getS3Paths(data: Array<any>) {
        const dataWithS3Paths = data.map(async item => {
            const attachments = await this.fileManager.getFiles(item.attachments);
            item.attachments = attachments;
        });
        return Promise.all(dataWithS3Paths);
    }
}
