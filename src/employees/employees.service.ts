import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Employees } from './employees.model';
import { filterForQuery } from '../utils/utils';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectModel('Employees') private readonly employeesModel: Model<Employees>,
    ) {
        // this.employeesModel.collection.countDocuments().then(async (res) => {
        //     if (res === 0) {
        //         const initialized = await this.insertImapAccount({
        //             user: 'user',
        //             password: 'password',
        //             host: 'host@example',
        //             port: 496,
        //             sockId: 50,
        //             serverId: 5,
        //             status: 'PAUSED',
        //             comments: 'comment',
        //             fetched: 'fetched message',
        //             flagged: true,
        //         });
        //         if (initialized) {
        //             console.log('Imap Account initialized');
        //         }
        //     }
        // });
    }

    async insertImapAccount(body) {
        const newImapAccount = new this.employeesModel({
            firstName: body.firstName,
            surname: body.surname,
            dateOfBirth: body.dateOfBirth,
            email: body.email,
            gender: body.gender,
            organization: body.organization,
            property: body.property,
            workingStatus: body.workingStatus,
        });
        const result = await newImapAccount.save();
        return result;
    }

    async getImapAccounts(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };
        const data = await this.employeesModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData)
            .populate('sockId')
            // .populate('property')
            .exec();
        // TODO - consider changing to actual documents count returned by query
        const count = await this.employeesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getManyImapAccounts(filter: any) {
        const data = await this.employeesModel
            .find({ _id: { $in: filter.ids } })
            .populate('sockId')
            .populate('serverId')
            .exec();
        const count = await this.employeesModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getOneAccounts(filter: any) {
        return await this.employeesModel
            .find({ _id: filter })
            .populate('sockId')
            .populate('serverId')
            .exec();
    }

    async getImapAccount(imapAccountId: string) {
        const imapAccount = await this.findImapAccount(imapAccountId);
        return imapAccount;
    }

    async isExistReferenceInImapAccount(fieldId: string, field: string) {
        const imapAccount = await this.employeesModel.find({ [field]: fieldId })
            .populate('sockId')
            .populate('serverId');
        return imapAccount;
    }

    async isExistMultiplsReferenceInImapAccount(filter: any, field: any) {
        const data = await this.employeesModel
            .find({ [field]: { $in: filter.ids } })
            .populate('sockId')
            .populate('serverId')
            .exec();
        return data;
    }

    async updateImapAccount(id, body): Promise<any> {
        Object.keys(body).forEach((item) => {
            if (body[item] === null) {
                delete body[item];
                Object.assign(body, {$unset: {[item]: 1 }});
            }
        });
        return await this.employeesModel.findByIdAndUpdate(id, body, { new: true })
            .populate('sockId')
            .populate('serverId');
    }

    async updateImapAccountEmailsCount(id): Promise<any> {
        return await this.employeesModel.findByIdAndUpdate({ _id: id }, { $inc: { sentEmailsCount: 1 } });
    }

    async updateImapAccounts(ids, playPauseStatus): Promise<any> {
        return await this.employeesModel.updateMany({ _id: { $in: ids } },
            { $set: { playPauseStatus } },
            { upsert: true });
    }

    async pauseImapAccountsRemoveSock(ids): Promise<any> {
        return await this.employeesModel.updateMany({ _id: { $in: ids } },
            { $set: { playPauseStatus: false }, $unset: {serverId: 1}},
            { upsert: true });
    }

    async removeServerFromImap(ids): Promise<any> {
        return await this.employeesModel.updateMany({ _id: { $in: ids } },
            {$unset: {serverId: 1 }},
            { upsert: true });
    }

    async deleteImapAccount(imapAccountId: string) {
        return await this.employeesModel.deleteOne({ _id: imapAccountId }).exec();
    }

    async deleteImapAccounts(imapAccountIds): Promise<any> {
        const { ids } = imapAccountIds;
        return await this.employeesModel.deleteMany({ _id: { $in: ids } });
    }

    async findImapAccount(id: string): Promise<Employees> {
        let imapAccount;
        try {
            imapAccount = await this.employeesModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find imap account.');
        }
        if (!imapAccount) {
            throw new NotFoundException('Could not find imap account.');
        }
        return imapAccount;
    }
}
