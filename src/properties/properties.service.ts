import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { filterForQuery } from '../utils/utils';
import { IFileManager } from '../common/fileManager/IFileManager.interface';
import { Properties, PropertiesDocument } from './schemas/properties.schema';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectModel(Properties.name) private readonly propertiesModel: Model<PropertiesDocument>,
        private fileManager: IFileManager,
    ) { }

    async insertProperty(body, userId) {
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
            authorId: userId,
        });
        const result = await newProperty.save();
        return result;
    }

    async getProperties(filter: string, limit: string, page: string, orderBy: string, orderDir: string, userId: string) {
        const parsedFilter = JSON.parse(filter);
        parsedFilter.authorId = userId;
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

        await this.getS3Paths(data);
        const count = await this.propertiesModel.countDocuments({authorId: filterData.authorId});

        return {
            data,
            count,
        };
    }

    async getManyProperties(filter: any) {
        const data = await this.propertiesModel
            .find({ _id: { $in: filter.id }})
            .exec();

        await this.getS3Paths(data);
        return {
            data,
            count: data.length,
        };
    }

    async getProperty(propertyId: string, userId: string) {
        const property = await this.findProperty(propertyId, userId);
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

    private async findProperty(id: string, userId: string): Promise<PropertiesDocument> {
        let property;
        try {
            property = await this.propertiesModel.findOne({_id: id, authorId: userId}).exec();
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
