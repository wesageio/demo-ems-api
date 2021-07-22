import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { Emails } from './email.model';
import { filterForQuery, writeData } from '../utils/utils';
import { AppGateway } from '../app.gateway';
import { EmployeesService } from '../employees/employees.service';
import { RulesService } from '../rules/rules.service';

@Injectable()
export class EmailsService {
    constructor(
        @InjectModel('Emails') private readonly emailsModel: Model<Emails>,
        private gateway: AppGateway,
        private employeesService: EmployeesService,
        private rulesService: RulesService,
    ) { }

    async insertEmail(body) {
        const modifiedAttachments = await writeData(body.attachments);
        const data = Object.assign({}, body, { attachments: modifiedAttachments ? modifiedAttachments : body.attachments });
        const imapAccount = await this.employeesService.getImapAccount(data.imapAccountId);
        const { rule } = await this.rulesService.getRule(data.ruleId);
        const newEmail = new this.emailsModel({
            // accountFlag: imapAccount.flagged,
            starred: data.starred,
            serverId: data.serverId,
            from: data.from,
            to: data.to,
            cc: data.cc,
            subject: data.subject,
            amount: data.amount,
            iban: data.iban,
            payablePeriod: data.payablePeriod,
            attachments: data.attachments,
            modificationComment: data.modificationComment,
            arrivalTime: data.arrivalTime.toString(),
            fetchedTime: data.fetchedTime,
            htmlBody: data.htmlBody,
            textBody: data.textBody,
            unread: data.unread,
            imapAccountId: imapAccount,
            emailId: data.emailId,
            ruleId: rule,
        });
        const result = await newEmail.save();
        this.gateway.wss.emit('getEmails', { data: result, resource: 'emails' });
        return result;
    }

    async getEmails(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.emailsModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData)
            .populate({
                path: 'imapAccountId',
                populate: [
                    { path: 'serverId' },
                    { path: 'sockId' },
                ],
             })
            .populate('ruleId')
            .exec();
        const count = await this.emailsModel.countDocuments();
        return {
            data,
            count,
        };
    }

    async getEmail(emailId: string) {
        const email = await this.findEmail(emailId);
        return email;
    }

    async updateEmail(id, body): Promise<any> {
        const modifiedAttachments = await writeData(body.attachments);
        if (modifiedAttachments) {
            body = Object.assign({}, body, { attachments: modifiedAttachments });
        }
        return await this.emailsModel.findByIdAndUpdate(id, body, { new: true }).populate({
            path: 'imapAccountId',
            populate: [
                { path: 'serverId' },
                { path: 'sockId' },
            ],
        }).populate('ruleId');
    }

    async updateEmails(ids, sent): Promise<any> {
        return await this.emailsModel.updateMany({ _id: { $in: ids } },
            { $set: { sent } },
            { upsert: true });
    }

    async deleteEmail(emailId: string) {
        return await this.emailsModel.deleteOne({ _id: emailId }).exec();
    }

    async deleteEmails(emailIds): Promise<any> {
        const { ids } = emailIds;
        return await this.emailsModel.deleteMany({ _id: { $in: ids } });
    }

    private async findEmail(id: string): Promise<Emails> {
        let email;
        try {
            email = await this.emailsModel.findById(id)
                .populate({
                    path: 'imapAccountId',
                    populate: { path: 'serverId' },
                })
                .exec();
        } catch (error) {
            throw new NotFoundException('Could not find email.');
        }
        if (!email) {
            throw new NotFoundException('Could not find email.');
        }
        return email;
    }
}
