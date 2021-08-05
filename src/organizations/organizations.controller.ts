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
    UseGuards,
    Req,
} from '@nestjs/common';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organizations.dto';
import { EmployeesService } from '../employees/employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';
import { Queries } from '../employees/customQueries/queries';

@Controller('organizations')
export class OrganizationsController {
    private readonly logger = new Logger('OrganizationsController');
    constructor(
        private readonly organizationsService: OrganizationsService,
        private employeesService: EmployeesService,
        private queryService: Queries,
    ) { }

    removeOrganizationFromEmployee = async (imapAccounts) => {
        await this.queryService.removeDeletedOrganization(imapAccounts);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addOrganization(
        @Res() res,
        @Body() OrganizationBody: CreateOrganizationDto,
    ) {
        this.logger.debug(`POST/organizations/ - add organization`, 'debug');
        const userId = getUserIdFromToken(res.req.headers.authorization);
        const data = await this.organizationsService.insertOrganization(OrganizationBody, userId);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            message: 'Organization has been successfully created',
            data,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllOrganizations(
        @Req() req,
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/organizations/ - get all organizations`, 'debug');
        const filteredData = JSON.parse(filter);
        const userId = getUserIdFromToken(req.headers.authorization);
        // if (filteredData.hasOwnProperty('id') && filteredData.id.length !== 0) {
        //     const referencedOrganizations = await this.organizationsService.getManyOrganizations(filteredData);
        //     return referencedOrganizations;
        // }
        const organizations = await this.organizationsService.getOrganizations(filter, limit, page, orderBy, orderDir, userId);
        return organizations;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getOrganization(
        @Param('id') organizationId: string,
        @Req() req,
    ) {
        this.logger.debug(`GET/organizations/:id - get organization`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        return this.organizationsService.getOrganization(organizationId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateOrganization(
        @Res() res,
        @Param('id') id: string,
        @Body() OrganizationBody: CreateOrganizationDto,
    ) {
        this.logger.debug(`PUT/organizations/:id - update organization`, 'debug');
        const updated = await this.organizationsService.updateOrganization(id, OrganizationBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Organization has been successfully updated',
            updated,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeOrganization(@Res() res, @Param('id') organizationId: string) {
        this.logger.debug(`DELETE/organizations/:id - delete organization`, 'debug');
        const foundOrganizationEmployee = await this.employeesService.isExistReferenceInEmployee(organizationId, 'organization');
        if (foundOrganizationEmployee.length !== 0) {
            this.removeOrganizationFromEmployee(foundOrganizationEmployee);
        }
        const organizationDelete = await this.organizationsService.deleteOrganization(organizationId);
        if (!organizationDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Organization has been successfully deleted',
            organizationDelete,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeOrganizations(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/organizations/ - delete organizations`, 'debug');
        const foundOrganizationEmployee = await this.employeesService.isExistMultiplsReferenceInEmployee(ids, 'organization');
        if (foundOrganizationEmployee.length !== 0) {
            this.removeOrganizationFromEmployee(foundOrganizationEmployee);
        }
        const deletedOrganizations = await this.organizationsService.deleteOrganizations(ids);
        if (!deletedOrganizations) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Organizations has been successfully deleted',
            deletedOrganizations,
        });
    }
}
