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
    UseGuards,
    Req,
} from '@nestjs/common';

import { PropertiesService } from './properties.service';
import { EmployeesService } from '../employees/employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';
import { CreatePropertyDto } from './dto/create-properties.dto';

@Controller('properties')
export class PropertiesController {
    private readonly logger = new Logger('PropertiesController');
    constructor(
        private readonly propertiesService: PropertiesService,
        @Inject(forwardRef(() => EmployeesService))
        private employeesService: EmployeesService,
    ) { }

    removeAlreadyDeletedPropertiesFromEmployees = (employees, propertyId) => {
        employees.forEach(async (employee) => {
            await this.employeesService.removeDeletedPropertiesFromEmployees(employee, propertyId);
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addProperty(
        @Res() res,
        @Body() PropertyBody: CreatePropertyDto,
    ) {
        this.logger.debug(`POST/properties/ - add property`, 'debug');
        const userId = getUserIdFromToken(res.req.headers.authorization);
        const data = await this.propertiesService.insertProperty(PropertyBody, userId);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            message: 'Property has been successfully created',
            data,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllProperties(
        @Req() req,
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/properties/ - get all properties`, 'debug');
        const filteredData = JSON.parse(filter);
        const userId = getUserIdFromToken(req.headers.authorization);
        if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
            const referencedProperties = await this.propertiesService.getManyProperties(filteredData);
            return referencedProperties;
        }
        const properties = await this.propertiesService.getProperties(filter, limit, page, orderBy, orderDir, userId);
        return properties;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getProperty(
        @Param('id') propertyId: string,
        @Req() req,
    ) {
        this.logger.debug(`GET/properties/ - get property`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        return this.propertiesService.getProperty(propertyId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateProperty(
        @Res() res,
        @Param('id') id: string,
        @Body() PropertiesBody: CreatePropertyDto,
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

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeProperty(@Res() res, @Param('id') propertyId: string) {
        this.logger.debug(`DELETE/properties/:id - delete property`, 'debug');
        const foundEmployeesWithProperty = await this.employeesService.isExistReferenceInEmployee(propertyId, 'property');
        await this.removeAlreadyDeletedPropertiesFromEmployees(foundEmployeesWithProperty, [propertyId]);
        const propertyDelete = await this.propertiesService.deleteProperty(propertyId);
        if (!propertyDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rule has been successfully deleted',
            propertyDelete,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeProperties(@Res() res, @Body() propertiesIds) {
        this.logger.debug(`DELETE/properties/ - delete properties`, 'debug');
        const foundEmployeesWithProperties = await this.employeesService.isExistMultiplsReferenceInEmployee(propertiesIds, 'property');
        await this.removeAlreadyDeletedPropertiesFromEmployees(foundEmployeesWithProperties, propertiesIds.ids);
        const deletedProperties = await this.propertiesService.deleteProperties(propertiesIds);
        if (!deletedProperties) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Properties has been successfully deleted',
            deletedProperties,
        });
    }
}
