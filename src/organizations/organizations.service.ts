import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Organizations, OrganizationsDocument } from './schemas/organizations.schema';
import { filterForQuery } from '../utils/utils';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectModel(Organizations.name) private readonly organizationsModel: Model<OrganizationsDocument>,
    ) { }

    async insertOrganization(body, userId) {
        const newOrganization = new this.organizationsModel({
            name: body.name,
            telephone: body.telephone,
            email: body.email,
            location: body.location,
            website: body.website,
            workers: body.workers,
            authorId: userId,
        });
        const result = await newOrganization.save();
        return result;
    }

    async getOrganizations(filter: string, limit: string, page: string, orderBy: string, orderDir: string, userId: string) {
        const parsedFilter = JSON.parse(filter);
        parsedFilter.authorId = userId;
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };
        const data = await this.organizationsModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData).exec();

        const count = await this.organizationsModel.countDocuments({authorId: filterData.authorId});

        return {
            data,
            count,
        };
    }

    async getManyOrganizations(filter: any) {
        const data = await this.organizationsModel
            .find({ _id: { $in: filter.id }})
            .exec();
        const count = await this.organizationsModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getOrganization(organizationId: string, userId: string) {
        const organization = await this.findOrganization(organizationId, userId);
        return { organization };
    }

    async updateOrganization(id, body): Promise<any> {
        return await this.organizationsModel.findByIdAndUpdate(id, body, { new: true });
    }

    async deleteOrganization(organizationId: string) {
        return await this.organizationsModel.deleteOne({ _id: organizationId }).exec();
    }

    async deleteOrganizations(organizationIds): Promise<any> {
        const { ids } = organizationIds;
        return await this.organizationsModel.deleteMany({ _id: { $in: ids } });
    }

    private async findOrganization(id: string, userId: string): Promise<OrganizationsDocument> {
        let organization;
        try {
            organization = await this.organizationsModel.findOne({_id: id, authorId: userId}).exec();
        } catch (error) {
            throw new NotFoundException('Could not find organization.');
        }
        if (!organization) {
            throw new NotFoundException('Could not find organization.');
        }
        return organization;
    }
}
