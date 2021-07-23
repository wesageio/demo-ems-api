import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    Query,
    Res,
    Put,
    NotFoundException,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';

import { SocksService } from './socks.service';
import { Organizations } from './socks.model';
import { EmployeesService } from '../employees/employees.service';
import { filterSocksImapAccounts } from '../utils/utils';

@Controller('organizations')
export class SocksController {
    logger = new Logger('SocksController');
    constructor(
        private readonly socksService: SocksService,
        private employeesService: EmployeesService,
    ) { }

    removeSocksFromImapAccounts = (imapAccounts) => {
        const filteredData = filterSocksImapAccounts(imapAccounts);
        filteredData.forEach(async (foundRunSocks) => {
            if (foundRunSocks.serverGroups) {
                const server = foundRunSocks.serverGroups[0].serverId;
                const serverIp = server.serverIp;
                const serverPort = server.port;
                if (foundRunSocks.runImapAccounts.length !== 0) {
                    await this.employeesService.pauseImapAccountsRemoveSock(foundRunSocks.runImapAccounts);
                }
                // await axios.put(`http://${serverIp}:${serverPort}/imapAccounts/stop`, foundRunSocks.serverGroups);
            }
        });
    }

    @Post()
    async addSock(
        @Res() res,
        @Body() SocksBody: Organizations,
    ) {
        this.logger.debug(`POST/socks/ - add sock`, 'debug');
        const data = await this.socksService.insertSock(SocksBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            message: 'Sock has been successfully created',
            data,
        });
    }

    @Get()
    async getAllSocks(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/socks/ - get all socks`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
            const referencedSocks = await this.socksService.getManySocks(filteredData);
            return referencedSocks;
        }
        const socks = await this.socksService.getSocks(filter, limit, page, orderBy, orderDir);
        return socks;
    }

    @Get(':id')
    getSock(@Param('id') sockId: string) {
        this.logger.debug(`GET/socks/:id - get sock`, 'debug');
        return this.socksService.getSock(sockId);
    }

    @Put(':id')
    async updateSock(
        @Res() res,
        @Param('id') id: string,
        @Body() SocksBody: Organizations,
    ) {
        this.logger.debug(`PUT/socks/:id - update sock`, 'debug');
        // if (SocksBody.test === true) {
        //     this.logger.debug(`PUT/socks/:id - testing sock`, 'log');
        //     /////////// EMAIL CATCHER ///////////
        //     // const response = await axios.put(`http://${SocksBody.ip}:${SocksBody.port}/socks/test`, SocksBody);
        //     /////////// SIMPLE EXAMPLE //////////
        //     const response = { status: 200, data : {message: 'Offline' }};
        //     if (response.status === 200) {
        //         this.logger.log(`PUT/socks/:id - ${SocksBody.ip} tested successfully`, 'log');
        //         await this.socksService.updateSock(id, response.data);
        //     } else {
        //         this.logger.warn(`PUT/socks/:id - ${SocksBody.ip} failed to test`, 'warn');
        //     }
        //     return res.status(200).json({
        //         response,
        //     });
        // } else {
        const updated = await this.socksService.updateSock(id, SocksBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        // const isRunImapAccountWithSock = await this.employeesService.isExistReferenceInImapAccount(id, 'sockId');
        // if (isRunImapAccountWithSock.length !== 0) {
        //     const serverIp = isRunImapAccountWithSock[0].serverId.serverIp;
        //     const serverPort = isRunImapAccountWithSock[0].serverId.port;
        //     const response = await axios.put(`http://${serverIp}:${serverPort}/imapAccounts`, isRunImapAccountWithSock);
        //     if (response.status === 200) {
        //         this.logger.log(`PUT/imapAccounts/ - ${isRunImapAccountWithSock[0].sockId.ip} successfully updated`, 'log');
        //     } else {
        //         this.logger.error(`STOP/imapAccounts/:id - ${isRunImapAccountWithSock[0].sockId.ip} failed to update`, 'error');
        //     }
        // }
        return res.status(200).json({
            message: 'Sock has been successfully updated',
            updated,
        });
    // }
    }

    @Delete(':id')
    async removeSock(@Res() res, @Param('id') sockId: string) {
        this.logger.debug(`DELETE/socks/:id - delete sock`, 'debug');
        const isRunImapAccountWithSock = await this.employeesService.isExistReferenceInImapAccount(sockId, 'sockId');
        if (isRunImapAccountWithSock.length !== 0) {
            this.removeSocksFromImapAccounts(isRunImapAccountWithSock);
        }
        const sockDelete = await this.socksService.deleteSock(sockId);
        if (!sockDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Sock has been successfully deleted',
            sockDelete,
        });
    }

    @Delete()
    async removeSocks(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/socks/ - delete socks`, 'debug');
        const foundSocksRunImapAccounts = await this.employeesService.isExistMultiplsReferenceInImapAccount(ids, 'sockId');
        if (foundSocksRunImapAccounts.length !== 0) {
            this.removeSocksFromImapAccounts(foundSocksRunImapAccounts);
        }
        const deletedSocks = await this.socksService.deleteSocks(ids);
        if (!deletedSocks) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Organizations has been successfully deleted',
            deletedSocks,
        });
    }
}
