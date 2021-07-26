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
} from '@nestjs/common';
import axios from 'axios';

import { RulesService } from './rules.service';
import { Rules } from './rules.model';
import { PropertiesService } from '../properties/properties.service';

@Controller('rules')
export class RulesController {
    logger = new Logger('RulesController');
    constructor(
        private readonly rulesService: RulesService,
        private propertiesService: PropertiesService,
    ) { }

    ruleUpdateEmailCatcher = async () => {
        // const serversList = await this.propertiesService.getServers('{}', '100', '1', 'id', 'ASC');
        const rulesList = await this.rulesService.getRules('{"isDeleted":false,"isActive":true}', '100', '1', 'id', 'ASC');
        // serversList.data.forEach(async (item) => {
        //     const response = await axios.put(`http://${item.serverIp}:${item.port}/rules`, rulesList.data);
        //     if (response.status === 200) {
        //         this.logger.log(`PUT/rules/ - successfully updated`, 'log');
        //     } else {
        //         this.logger.error(`PUT/rules/ - failed to update`, 'error');
        //     }
        // });
    }

    @Post()
    async addRule(
        @Res() res,
        @Body() RulesBody: Rules,
    ) {
        this.logger.debug(`POST/rules/ - add rule`, 'debug');
        const data = await this.rulesService.insertRule(RulesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        await this.ruleUpdateEmailCatcher();
        return res.status(200).json({
            message: 'Rule has been successfully created',
            data,
        });
    }

    @Get()
    async getAllRules(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/rules/ - get all rules`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
            const referencedservers = await this.rulesService.getManyRules(filteredData);
            return referencedservers;
        }
        const rules = await this.rulesService.getRules(filter, limit, page, orderBy, orderDir);
        return rules;
    }

    @Get(':id')
    getRule(@Param('id') ruleId: string) {
        this.logger.debug(`GET/rules/:id - get rule`, 'debug');
        return this.rulesService.getRule(ruleId);
    }

    @Put(':id')
    async updateRule(
        @Res() res,
        @Param('id') id: string,
        @Body() RulesBody: Rules,
    ) {
        this.logger.debug(`PUT/rules/:id - update rule`, 'debug');
        const updated = await this.rulesService.updateRule(id, RulesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        await this.ruleUpdateEmailCatcher();
        return res.status(200).json({
            message: 'Email has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeRule(@Res() res, @Param('id') ruleId: string) {
        this.logger.debug(`DELETE/rules/:id - delete rule`, 'debug');
        const deleteRule = await this.rulesService.deleteRule(ruleId);
        if (!deleteRule) {
            throw new NotFoundException('Id does not exist!');
        }
        await this.ruleUpdateEmailCatcher();
        return res.status(200).json({
            message: 'Rule has been successfully deleted',
            deleteRule,
        });
    }

    @Delete()
    async removeRules(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/rules/ - delete rules`, 'debug');
        const deletedRules = await this.rulesService.deleteRules(ids);
        if (!deletedRules) {
            throw new NotFoundException('Id does not exist!');
        }
        await this.ruleUpdateEmailCatcher();
        return res.status(200).json({
            message: 'Rules has been successfully deleted',
            deletedRules,
        });
    }
}
