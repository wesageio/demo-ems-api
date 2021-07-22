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
    Logger,
    forwardRef,
    Inject,
} from '@nestjs/common';
import axios from 'axios';

import { EmployeesService } from './employees.service';
import { Employees } from './employees.model';
import { filterDataWithServerId } from '../utils/utils';
import { PropertiesService } from '../properties/properties.service';
import { AppGateway } from '../app.gateway';

@Controller('employees')
export class EmployeesController {
    logger = new Logger('EmployeesController');
    constructor(
        private readonly employeesService: EmployeesService,
        @Inject(forwardRef(() => PropertiesService))
        private proeprtiesService: PropertiesService,
        private gateway: AppGateway,
    ) { }

    @Post()
    async addImapAccount(
        @Res() res,
        @Body() ImapAccountBody: Employees,
    ) {
        this.logger.debug(`POST/imapAccounts - addImapAccount ${ImapAccountBody.firstName}`, 'debug');
        const data = await this.employeesService.insertImapAccount(ImapAccountBody);
        if (!data) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Imap Account has been successfully creted',
            data,
        });
    }

    @Get()
    async getAllImapAccounts(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/imapAccounts/ - get all Imap Accounts`, 'debug');
        const imapAccounts = await this.employeesService.getImapAccounts(filter, limit, page, orderBy, orderDir);
        return imapAccounts;
    }

    @Get(':id')
    getImapAccount(@Param('id') imapAccountId: string) {
        this.logger.debug(`GET/imapAccounts/:id - get imap account ${imapAccountId}`, 'debug');
        return this.employeesService.getImapAccount(imapAccountId);
    }

    @Put(':id/status')
    async updateImapAccountStatus(
        @Param('id') id: string,
        @Body() ImapAccountBody: Employees,
    ) {
        this.logger.debug(`PUT:id/status - update status of imap account ${ImapAccountBody.workingStatus}`, 'debug');
        const currentImapAccount = await this.employeesService.getOneAccounts(id);
        if (currentImapAccount.length === 0) {
            this.logger.warn(`PUT:id/status update status - ${id} does not exist!`);
            return null;
        }
        const updated = await this.employeesService.updateImapAccount(id, ImapAccountBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        this.logger.log(`PUT:id/status update status - ${updated.user} successfully updated`);
        this.gateway.wss.emit('getImapAccounts', { data: updated, resource: 'imapAccounts' });
    }

    @Put(':id')
    async updateImapAccount(
        @Res() res,
        @Param('id') id: string,
        @Body() ImapAccountBody: Employees,
    ) {
        this.logger.debug(`PUT/imapAccounts/:id - update imap account`, 'debug');
        // if (ImapAccountBody.serverId) {
        //     this.logger.debug(`PUT/imapAccounts/:id - update imap account's server`, 'debug');
        //     const catcherRequestBody = await this.employeesService.getOneAccounts(id);
        //     if (catcherRequestBody[0].playPauseStatus === true && catcherRequestBody[0].serverId) {
        //         const oldIp = catcherRequestBody[0].serverId.serverIp;
        //         const oldPort = catcherRequestBody[0].serverId.port;
        //         const emailCatcherStop = await axios.put(`http://${oldIp}:${oldPort}/imapAccounts/stop`, catcherRequestBody);
        //         if (emailCatcherStop.status !== 200) {
        //             this.logger.warn(`PUT:id/ update imap - ${catcherRequestBody[0].user} could not stop`);
        //             throw new InternalServerErrorException('Could not change status of IMAP accounts!');
        //         } else {
        //             this.logger.log(`PUT:id/ update imap - ${oldIp} successfully stoped`);
        //             const serverId = await this.proeprtiesService.getServer(ImapAccountBody.serverId);
        //             const newIpStart = serverId.server.serverIp;
        //             const newPortStart = serverId.server.port;
        //             const emailCatcherStart = await axios.put(`http://${newIpStart}:${newPortStart}/imapAccounts/start`, catcherRequestBody);
        //             if (emailCatcherStart.status !== 200) {
        //                 this.logger.warn(`PUT:id/ update imap - ${catcherRequestBody[0].user} could not start`);
        //                 throw new InternalServerErrorException('Could not change status of IMAP accounts!');
        //             }
        //             this.logger.log(`PUT:id/ update imap - ${newIpStart} successfully started`);
        //         }
        //     }
        // }
        const updated = await this.employeesService.updateImapAccount(id, ImapAccountBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        this.gateway.wss.emit('getImapAccounts', { data: updated, resource: 'imapAccounts' });
        // if (updated.serverId) {
        //     const response = await axios.put(`http://${updated.serverId.serverIp}:${updated.serverId.port}/imapAccounts`, [updated]);
        //     if (response.status === 200) {
        //         this.logger.log(`PUT:id/ update imap - ${updated.user} successfully updated`, 'log');
        //     } else {
        //         this.logger.error(`PUT:id/ update imap - ${updated.user} failed to update`, 'error');
        //     }
        // }
        return res.status(200).json({
            message: 'Imap Account has been successfully updated',
            updated,
        });
    }

    @Put()
    async updateImapAccounts(
        @Res() res, @Body() body,
    ) {
        this.logger.debug(`PUT/imapAccounts - update imap accounts`, 'debug');
        await this.employeesService.updateImapAccounts(body.ids, body.playPauseStatus);
        // const catcherRequestBody = await this.employeesService.getManyImapAccounts(body);
        // const filteredData = filterDataWithServerId(catcherRequestBody.data, body);
        // const promises = filteredData.map((imapAccount) => {
        //     const serverIp = imapAccount[0].serverId.serverIp;
        //     const serverPort = imapAccount[0].serverId.port;
        //     const status = imapAccount[0].playPauseStatus ? 'start' : 'stop';
        //     return axios.put(`http://${serverIp}:${serverPort}/imapAccounts/${status}`, imapAccount);
        // });
        // const contents = await Promise.all(promises);
        // const failed = [];
        // contents.map(async (item) => {
        //     const email = JSON.parse(item.config.data);
        //     if (item.status !== 200) {
        //         failed.push(email);
        //     }
        // });
        // if (failed.length !== 0) {
        //     return res.send(failed.map(item => {
        //         this.logger.warn(`PUT:ids/ update imap accounts action's status - ${body.playPauseStatus ? 'start' : 'stop'} ${item.user}`, 'warn');
        //         return item;
        //     }));
        // } else {
        //     catcherRequestBody.data.forEach((item) => {
        //         this.logger.log(`PUT:ids/ update imap accounts action\'s status - ${item.playPauseStatus ? 'start' : 'stop'} ${item.user}`, 'log');
        //     });
        //     return res.status(200).json([]);
        // }
    }

    @Delete(':id')
    async removeImapAccount(@Res() res, @Param('id') imapAccountId: string) {
        this.logger.debug(`DELETE/imapAccounts/:id - delete imap account`, 'debug');
        const currentImapAccount = await this.employeesService.getOneAccounts(imapAccountId);
        // const serverIp = currentImapAccount[0].serverId.serverIp;
        // const serverPort = currentImapAccount[0].serverId.port;
        const deleteImapAccount = await this.employeesService.deleteImapAccount(imapAccountId);
        // if (!deleteImapAccount) {
        //     throw new NotFoundException('Id does not exist!');
        // }
        // if (currentImapAccount && currentImapAccount[0].serverId) {
        //     this.logger.debug(`DELETE/imapAccounts/:id - stop imap account`, 'debug');
        //     const response = await axios.put(`http://${serverIp}:${serverPort}/imapAccounts/stop`, currentImapAccount);
        //     if (response.status === 200) {
        //         this.logger.log(`STOP/imapAccounts/:id - ${currentImapAccount[0].user} successfully stoped`, 'log');
        //     } else {
        //         this.logger.error(`STOP/imapAccounts/:id - ${currentImapAccount[0].user} failed to stop`, 'error');
        //     }
        // }
        return res.status(200).json({
            message: 'Imap Account has been successfully deleted',
            deleteImapAccount,
        });
    }

    @Delete()
    async removeImapAccounts(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/imapAccounts/ - delete imap accounts ${ids.ids}`, 'debug');
        const deletedImapAccounts = await this.employeesService.deleteImapAccounts(ids);
        if (!deletedImapAccounts) {
            throw new NotFoundException('Id does not exist!');
        }
        const catcherRequestBody = await this.employeesService.getManyImapAccounts(ids);
        const filteredData = filterDataWithServerId(catcherRequestBody.data, false);
        filteredData.forEach(async (imapAccount) => {
            const serverIp = imapAccount[0].serverId.serverIp;
            const serverPort = imapAccount[0].serverId.port;
            const response = await axios.put(`http://${serverIp}:${serverPort}/imapAccounts/stop`, imapAccount);
            if (response.status === 200) {
                this.logger.log(`STOP/imapAccounts/ - successfully stoped`, 'log');
            } else {
                this.logger.error(`STOP/imapAccounts/ - failed to stop`, 'error');
            }
        });
        return res.status(200).json({
            message: 'Imap Accounts has been successfully deleted',
            deletedImapAccounts,
        });
    }
}
