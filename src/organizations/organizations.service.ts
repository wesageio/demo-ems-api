import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Organizations } from './organizations.model';
import { filterForQuery } from '../utils/utils';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectModel('Organizations') private readonly organizationsModel: Model<Organizations>,
    ) { }

    async insertOrganization(body) {
        const newOrganization = new this.organizationsModel({
            name: body.name,
            telephone: body.telephone,
            email: body.email,
            location: body.location,
            website: body.website,
            workers: body.workers,
        });
        const result = await newOrganization.save();
        return result;
    }

    async getOrganizations(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
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

        const count = await this.organizationsModel.countDocuments();
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

    async getOrganization(organizationId: string) {
        const organization = await this.findOrganization(organizationId);
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

    private async findOrganization(id: string): Promise<Organizations> {
        let organization;
        try {
            organization = await this.organizationsModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find organization.');
        }
        if (!organization) {
            throw new NotFoundException('Could not find organization.');
        }
        return organization;
    }
}
