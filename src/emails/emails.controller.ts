import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    Query,
    Put,
    NotFoundException,
    Res,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import axios from 'axios';

import { EmailsService } from './emails.service';
import { Emails } from './email.model';

@Controller('emails')
export class EmailsController {
    logger = new Logger('EmailsController');
    constructor(
        private readonly emailsService: EmailsService,
    ) { }

    @Post()
    async addEmail(
        @Res() res,
        @Body() EmailBody: Emails,
    ) {
        this.logger.debug(`POST/emails - add email ${EmailBody.emailId}`, 'debug');
        const data = await this.emailsService.insertEmail(EmailBody);
        if (!data) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Email has been successfully creted',
            data,
        });
    }

    @Get()
    async getAllEmails(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug('GET/emails - get all emails', 'debug');
        const emails = await this.emailsService.getEmails(filter, limit, page, orderBy, orderDir);
        return emails;
    }

    @Get(':id')
    getEmail(@Param('id') emailId: string) {
        this.logger.debug(`GET/emails/:id - get email ${emailId}`, 'debug');
        return this.emailsService.getEmail(emailId);
    }

    @Put(':id')
    async updateEmail(
        @Res() res,
        @Param('id') id: string,
        @Body() EmailBody: Emails,
    ) {
        this.logger.debug('PUT/emails/:id - update email', 'debug');
        if (EmailBody.sendEmail === true) {
            this.logger.debug('PUT/emails/:id - send email', 'debug');
            const serverIp = EmailBody.imapAccountId.serverId.serverIp;
            const serverPort = EmailBody.imapAccountId.serverId.port;
            const emailCatcherResponse = await axios.put(`http://${serverIp}:${serverPort}/emails/send`, EmailBody);
            if (emailCatcherResponse.status !== 200) {
                this.logger.warn(`PUT:id/ send email - ${EmailBody.emailId} could not send`);
                throw new InternalServerErrorException('Could not send email!');
            } else {
                this.logger.log(`PUT:id/ send email - ${EmailBody.emailId} successfully send`);
                await this.emailsService.deleteEmail(id);
                return res.status(200).json({
                    message: 'Email has been successfully sent',
                });
            }
        } else {
            this.logger.debug('PUT/emails/:id - update email fields', 'debug');
            const updated = await this.emailsService.updateEmail(id, EmailBody);
            if (!updated) {
                throw new NotFoundException('Id does not exist!');
            }
            this.logger.log(`PUT/emails/:id - email successfully updated`, 'debug');
            return res.status(200).json({
                message: 'Email has been successfully updated',
                updated,
            });
        }
    }

    @Put()
    async updateEmails(
        @Res() res, @Body() body,
    ) {
        this.logger.debug('PUT/emails/ - send emails', 'debug');
        const emailsBodyToCatcher = await Promise.all(body.ids.map(async (item) => {
            const EmailBody = await this.emailsService.getEmail(item);
            return EmailBody;
        }));
        const sendEmails = emailsBodyToCatcher.map((file: any) => {
            const serverIp = file.imapAccountId.serverId.serverIp;
            const serverPort = file.imapAccountId.serverId.port;
            return axios.put(`http://${serverIp}:${serverPort}/emails/send`, file);
        });
        const contents = await Promise.all(sendEmails);
        const failed = [];
        contents.map(async (item) => {
            const email = JSON.parse(item.config.data);
            if (item.status === 200) {
                await this.emailsService.deleteEmail(email._id);
            } else {
                failed.push(email);
            }
        });
        if (failed.length !== 0) {
            return res.send(failed.map(item => {
                this.logger.warn(`PUT:ids/ failed to send ${item.emailId}`, 'warn');
                return item;
            }));
        } else {
            contents.forEach((item) => {
                this.logger.log(`PUT:ids/ emails sent ${JSON.parse(item.config.data.emailId)}`, 'log');
            });
            return res.status(200).json([]);
        }
    }

    @Delete(':id')
    async removeEmail(@Res() res, @Param('id') emailId: string) {
        this.logger.debug(`DELETE/emails/:id - delete email`, 'debug');
        const deleteEmail = await this.emailsService.deleteEmail(emailId);
        if (!deleteEmail) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Email has been successfully deleted',
            deleteEmail,
        });
    }

    @Delete()
    async removeEmails(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/emails/ - delete emails`, 'debug');
        const deleteEmails = await this.emailsService.deleteEmails(ids);
        if (!deleteEmails) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Emails has been successfully deleted',
            deleteEmails,
        });
    }
}
