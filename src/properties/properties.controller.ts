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
    Inject,
    forwardRef,
} from '@nestjs/common';

import { PropertiesService } from './properties.service';
import { Properties } from './properties.model';
import { EmployeesService } from '../employees/employees.service';

@Controller('properties')
export class PropertiesController {
    logger = new Logger('PropertiesController');
    constructor(
        private readonly propertiesService: PropertiesService,
        @Inject(forwardRef(() => EmployeesService))
        private employeesService: EmployeesService,
    ) { }

    removeServerFromImapAccounts = (imapAccounts) => {
        imapAccounts.forEach(async (imapAccount) => {
            await this.employeesService.removeServerFromImap(imapAccount);
        });
    }

    @Post()
    async addServer(
        @Res() res,
        @Body() ServersBody: Properties,
    ) {
        this.logger.debug(`POST/servers/ - add server`, 'debug');
        const data = await this.propertiesService.insertServer(ServersBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            message: 'Server has been successfully created',
            data,
        });
    }

    @Get()
    async getAllServers(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/servers/ - get all servers`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
            const referencedservers = await this.propertiesService.getManyServers(filteredData);
            return referencedservers;
        }
        const servers = await this.propertiesService.getServers(filter, limit, page, orderBy, orderDir);
        return servers;
    }

    @Get(':id')
    getServer(@Param('id') serverId: string) {
        this.logger.debug(`GET/servers/ - get server`, 'debug');
        return this.propertiesService.getServer(serverId);
    }

    @Put(':id')
    async updateServer(
        @Res() res,
        @Param('id') id: string,
        @Body() ServersBody: Properties,
    ) {
        this.logger.debug(`PUT/servers/:id - update server`, 'debug');
        const updated = await this.propertiesService.updateServer(id, ServersBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Server has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeServer(@Res() res, @Param('id') serverId: string) {
        this.logger.debug(`DELETE/servers/:id - delete server`, 'debug');
        const foundSocksRunImapAccounts = await this.employeesService.isExistReferenceInImapAccount(serverId, 'serverId');
        await this.removeServerFromImapAccounts(foundSocksRunImapAccounts);
        const serverDelete = await this.propertiesService.deleteServer(serverId);
        if (!serverDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rule has been successfully deleted',
            serverDelete,
        });
    }

    @Delete()
    async removeServers(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/servers/ - delete servers`, 'debug');
        const foundSocksRunImapAccounts = await this.employeesService.isExistMultiplsReferenceInImapAccount(ids, 'serverId');
        await this.removeServerFromImapAccounts(foundSocksRunImapAccounts);
        const deletedServers = await this.propertiesService.deleteServers(ids);
        if (!deletedServers) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Servers has been successfully deleted',
            deletedServers,
        });
    }
}
