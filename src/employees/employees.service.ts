import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { filterForQuery } from '../utils/utils';
// import { Employees, EmployeesDocument } from './schemas/employees.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Employees } from './schemas/employees.entity';
import { Repository, getMongoRepository } from 'typeorm';
import { ObjectID } from 'bson';
import { User } from 'dist/user/user.entity';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectRepository(Employees)
        private readonly employeesRepository: Repository<Employees>,
    ) { }

    async insertEmployee(body, userId) {
        const newEmployee = this.employeesRepository.create({
            firstName: body.firstName,
            surname: body.surname,
            dateOfBirth: body.dateOfBirth,
            email: body.email,
            gender: body.gender,
            organization: body.organization,
            property: body.property,
            workingStatus: body.workingStatus,
            authorId: userId,
        });
        const result = await this.employeesRepository.save(newEmployee);
        return result;
    }

    async getEmployees(filter: string, limit: string, page: string, orderBy: string, orderDir: string, userId: string) {
        const parsedFilter = JSON.parse(filter);
        parsedFilter.authorId = userId;
        const filterData = filterForQuery(parsedFilter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = {
            [orderBy]: orderDir,
        };

        const data = await this.employeesRepository.find({
            where: filterData,
            order: sortData,
            skip: skipNumber,
            take: maxNumber,
        });
        const count = await this.employeesRepository.count({authorId: filterData.authorId});

        return {
            data,
            count,
        };
    }

    // async getManyImapAccounts(filter: any) {
    //     const data = await this.employeesModel
    //         .find({ _id: { $in: filter.ids } })
    //         .populate('sockId')
    //         .populate('serverId')
    //         .exec();
    //     const count = await this.employeesModel.countDocuments();
    //     return {
    //         data,
    //         count,
    //     };
    // }

    // async getOneAccounts(filter: any) {
    //     return await this.employeesModel
    //         .find({ _id: filter })
    //         .populate('sockId')
    //         .populate('serverId')
    //         .exec();
    // }

    async getEmployee(employeeId: string, userId: string) {
        const employee = await this.findEmployee(employeeId, userId);
        return {
            employee,
        };
    }

    async isExistReferenceInEmployee(fieldId: string, field: string) {
        const employee = await this.employeesRepository.find({ [field]: fieldId });
        return employee;
    }

    async isExistMultiplsReferenceInEmployee(filter: any, field: any) {
        const repository = getMongoRepository(Employees);
        const data = await repository.find({ [field]: { $in: filter.ids } });
        return data;
    }

    async updateEmployee(id, body): Promise<any> {
        Object.keys(body).forEach((item) => {
            if (body[item] === null) {
                delete body[item];
                Object.assign(body, {$unset: {[item]: 1 }});
            }
        });
        return await this.employeesRepository.update(
            { id: new ObjectID(id) },
            body,
        );
    }

    async deleteEmployee(employeeId: string) {
        return await this.employeesRepository.delete(employeeId);
    }

    async deleteEmployees(employeesIds): Promise<any> {
        const { ids } = employeesIds;
        return await this.employeesRepository.delete(ids);
    }

    async findEmployee(id: string, userId: string): Promise<Employees> {
        let employee;
        try {
            employee = await this.employeesRepository.findOne(id, {where: {authorId: userId}});
        } catch (error) {
            throw new NotFoundException('Could not find employee.');
        }
        if (!employee) {
            throw new NotFoundException('Could not find employee.');
        }
        return employee;
    }
}
