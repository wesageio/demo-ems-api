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
    UseGuards,
} from '@nestjs/common';

import { EmployeesService } from './employees.service';
import { Employees } from './employees.model';
import { PropertiesService } from '../properties/properties.service';
import { AppGateway } from '../app.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employees')
export class EmployeesController {
    logger = new Logger('EmployeesController');
    constructor(
        private readonly employeesService: EmployeesService,
        @Inject(forwardRef(() => PropertiesService))
        private gateway: AppGateway,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addEmployee(
        @Res() res,
        @Body() EmployeeBody: Employees,
    ) {
        this.logger.debug(`POST/employees - addEmployee ${EmployeeBody.firstName}`, 'debug');
        const data = await this.employeesService.insertEmployee(EmployeeBody);
        if (!data) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Employee has been successfully creted',
            data,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllEmployees(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/employees/ - get all Employees`, 'debug');
        const employees = await this.employeesService.getEmployees(filter, limit, page, orderBy, orderDir);
        return employees;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getEmployee(@Param('id') employeeId: string) {
        // this.logger.debug(`GET/employees/:id - get employee ${employeeId}`, 'debug');
        return this.employeesService.getEmployee(employeeId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateEmployee(
        @Res() res,
        @Param('id') id: string,
        @Body() EmployeeBody: Employees,
    ) {
        this.logger.debug(`PUT/employees/:id - update employee`, 'debug');
        const updated = await this.employeesService.updateEmployee(id, EmployeeBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Employee has been successfully updated',
            updated,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async updateEmployees(
        @Res() res, @Body() body,
    ) {
        this.logger.debug(`PUT/employees - update employees`, 'debug');
        await this.employeesService.updateEmployees(body.ids, body.playPauseStatus);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeEmployee(@Res() res, @Param('id') employeeId: string) {
        this.logger.debug(`DELETE/employees/:id - delete employee`, 'debug');
        const deleteEmployee = await this.employeesService.deleteEmployee(employeeId);
        return res.status(200).json({
            message: 'Employee has been successfully deleted',
            deleteEmployee,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeEmployees(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/employees/ - delete employees ${ids.ids}`, 'debug');
        const deletedEmployees = await this.employeesService.deleteEmployees(ids);
        if (!deletedEmployees) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Employees has been successfully deleted',
            deletedEmployees,
        });
    }
}
