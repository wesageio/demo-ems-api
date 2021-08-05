import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID } from 'bson';

import { filterForQuery } from '../utils/utils';
import { IFileManager } from '../common/fileManager/IFileManager.interface';
import { Repository } from 'typeorm';
import { Properties } from './schemas/properties.entity';

@Injectable()
export class PropertiesService {
    constructor(
        @InjectRepository(Properties)
        private readonly propertiesRepository: Repository<Properties>,
        private fileManager: IFileManager,
    ) { }

    async insertProperty(body, userId) {
        const modifiedAttachments = await this.fileManager.insertFile(body.attachments);
        const data = Object.assign({}, body, { attachments: modifiedAttachments ? modifiedAttachments : body.attachments });
        const newProperty = this.propertiesRepository.create({
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
        const result = await this.propertiesRepository.save(newProperty);
        return result;
    }

    async getProperties(filter: any, limit: string, page: string, orderBy: string, orderDir: string, userId: string) {
        filter.authorId = userId;
        const filterData = filterForQuery(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.propertiesRepository.find({
            where: filterData,
            order: sortData,
            skip: skipNumber,
            take: maxNumber,
        });
            // .find(filterData)
            // .limit(maxNumber)
            // .skip(skipNumber)
            // .sort(sortData).exec();
        await this.getS3Paths(data);
        const count = await this.propertiesRepository.count({authorId: filterData.authorId});

        return {
            data,
            count,
        };
    }

    // async getManyProperties(filter: any) {
    //     const data = await this.propertiesModel
    //         .find({ _id: { $in: filter.id }})
    //         .exec();

    //     await this.getS3Paths(data);
    //     return {
    //         data,
    //         count: data.length,
    //     };
    // }

    async getProperty(propertyId: string, userId: string) {
        const property = await this.findProperty(propertyId, userId);
        if (property.attachments) {
            await this.fileManager.getFiles(property.attachments);
        }
        return {
            property,
        };
    }

    async updateProperty(id, body): Promise<any> {
        const modifiedAttachments = await this.fileManager.insertFile(body.attachments);
        if (modifiedAttachments) {
            body = Object.assign({}, body, { attachments: modifiedAttachments });
        }
        return await this.propertiesRepository.update(
            { id: new ObjectID(id) },
            body,
        );
    }

    async deleteProperty(propertyId: string) {
        return await this.propertiesRepository.delete(propertyId);
    }

    async deleteProperties(propertyIds): Promise<any> {
        const { ids } = propertyIds;
        return await this.propertiesRepository.delete(ids);
    }

    private async findProperty(id: string, userId: string): Promise<Properties> {
        let property;
        try {
            property = await this.propertiesRepository.findOne(id, {where: {authorId: userId}});
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
            if (item.attachments && item.attachments.length !== 0) {
                const attachments = await this.fileManager.getFiles(item.attachments);
                item.attachments = attachments;
            }
        });
        return Promise.all(dataWithS3Paths);
    }
}
