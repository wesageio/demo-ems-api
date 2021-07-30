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
    UseGuards,
    Req,
} from '@nestjs/common';

import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('employees')
export class EmployeesController {
    private readonly logger = new Logger('EmployeesController');
    constructor(
        private readonly employeesService: EmployeesService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addEmployee(
        @Res() res,
        @Body() EmployeeBody: CreateEmployeeDto,
    ) {
        this.logger.debug(`POST/employees - addEmployee ${EmployeeBody.firstName}`, 'debug');
        const userId = getUserIdFromToken(res.req.headers.authorization);
        const data = await this.employeesService.insertEmployee(EmployeeBody, userId);
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
        @Req() req,
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/employees/ - get all Employees`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        const employees = await this.employeesService.getEmployees(filter, limit, page, orderBy, orderDir, userId);
        return employees;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getEmployee(
        @Param('id') employeeId: string,
        @Req() req,
    ) {
        this.logger.debug(`GET/employees/:id - get employee ${employeeId}`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        return this.employeesService.getEmployee(employeeId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateEmployee(
        @Res() res,
        @Param('id') id: string,
        @Body() EmployeeBody: CreateEmployeeDto,
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
