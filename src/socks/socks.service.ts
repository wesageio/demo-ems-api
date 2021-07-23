import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Organizations } from './socks.model';
import { filterForQuery } from '../utils/utils';

@Injectable()
export class SocksService {
    constructor(
        @InjectModel('Organizations') private readonly socksModel: Model<Organizations>,
    ) { }

    async insertSock(body) {
        const newSock = new this.socksModel({
            name: body.name,
            telephone: body.telephone,
            email: body.email,
            location: body.location,
            website: body.website,
            workers: body.workers,
        });
        const result = await newSock.save();
        return result;
    }

    async getSocks(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };
        const data = await this.socksModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData).exec();

        const count = await this.socksModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getManySocks(filter: any) {
        const data = await this.socksModel
            .find({ _id: { $in: filter.id }})
            .exec();
        const count = await this.socksModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getSock(sockId: string) {
        const sock = await this.findSock(sockId);
        return { sock };
    }

    async updateSock(id, body): Promise<any> {
        return await this.socksModel.findByIdAndUpdate(id, body, { new: true });
    }

    async deleteSock(sockId: string) {
        return await this.socksModel.deleteOne({ _id: sockId }).exec();
    }

    async deleteSocks(sockIds): Promise<any> {
        const { ids } = sockIds;
        return await this.socksModel.deleteMany({ _id: { $in: ids } });
    }

    private async findSock(id: string): Promise<Organizations> {
        let sock;
        try {
            sock = await this.socksModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find sock.');
        }
        if (!sock) {
            throw new NotFoundException('Could not find sock.');
        }
        return sock;
    }
}
