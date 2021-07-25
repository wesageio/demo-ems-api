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

    removeDeletedPropertiesFromEmployees = (employees) => {
        employees.forEach(async (employee) => {
            await this.employeesService.removeDeletedPropertiesFromEmployees(employee);
        });
    }

    @Post()
    async addProperty(
        @Res() res,
        @Body() PropertyBody: Properties,
    ) {
        this.logger.debug(`POST/properties/ - add proeprty`, 'debug');
        const data = await this.propertiesService.insertProeprty(PropertyBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            message: 'Property has been successfully created',
            data,
        });
    }

    @Get()
    async getAllProperties(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/properties/ - get all properties`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
            const referencedProperties = await this.propertiesService.getManyProperties(filteredData);
            return referencedProperties;
        }
        const properties = await this.propertiesService.getProperties(filter, limit, page, orderBy, orderDir);
        return properties;
    }

    @Get(':id')
    getProperty(@Param('id') propertyId: string) {
        this.logger.debug(`GET/proeprties/ - get property`, 'debug');
        return this.propertiesService.getProperty(propertyId);
    }

    @Put(':id')
    async updateProperty(
        @Res() res,
        @Param('id') id: string,
        @Body() PropertiesBody: Properties,
    ) {
        this.logger.debug(`PUT/properties/:id - update property`, 'debug');
        const updated = await this.propertiesService.updateProperty(id, PropertiesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Property has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeProperty(@Res() res, @Param('id') propertyId: string) {
        this.logger.debug(`DELETE/properties/:id - delete property`, 'debug');
        const foundSocksRunImapAccounts = await this.employeesService.isExistReferenceInEmployee(propertyId, 'property');
        await this.removeDeletedPropertiesFromEmployees(foundSocksRunImapAccounts);
        const propertyDelete = await this.propertiesService.deleteProperty(propertyId);
        if (!propertyDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rule has been successfully deleted',
            propertyDelete,
        });
    }

    @Delete()
    async removeProperties(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/properties/ - delete properties`, 'debug');
        const foundSocksRunImapAccounts = await this.employeesService.isExistMultiplsReferenceInEmployee(ids, 'property');
        await this.removeDeletedPropertiesFromEmployees(foundSocksRunImapAccounts);
        const deletedProperties = await this.propertiesService.deleteProperties(ids);
        if (!deletedProperties) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Properties has been successfully deleted',
            deletedProperties,
        });
    }
}
