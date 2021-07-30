import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { filterForQuery } from '../utils/utils';
import { Employees, EmployeesDocument } from './schemas/employees.schema';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectModel(Employees.name) private readonly employeesModel: Model<EmployeesDocument>,
    ) { }

    async insertEmployee(body, userId) {
        const newEmployee = new this.employeesModel({
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
        const result = await newEmployee.save();
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
        const data = await this.employeesModel
            .find(filterData)
            .limit(maxNumber)
            .skip(skipNumber)
            .sort(sortData)
            .exec();

        const count = await this.employeesModel.countDocuments({authorId: filterData.authorId});

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
        return employee;
    }

    async isExistReferenceInEmployee(fieldId: string, field: string) {
        const employee = await this.employeesModel.find({ [field]: fieldId });
        return employee;
    }

    async isExistMultiplsReferenceInEmployee(filter: any, field: any) {
        const data = await this.employeesModel
            .find({ [field]: { $in: filter.ids } })
            .populate('sockId')
            .populate('serverId')
            .exec();
        return data;
    }

    async updateEmployee(id, body): Promise<any> {
        Object.keys(body).forEach((item) => {
            if (body[item] === null) {
                delete body[item];
                Object.assign(body, {$unset: {[item]: 1 }});
            }
        });
        return await this.employeesModel.findByIdAndUpdate(id, body, { new: true })
            .populate('sockId')
            .populate('serverId');
    }

    async updateEmployees(ids, playPauseStatus): Promise<any> {
        return await this.employeesModel.updateMany({ _id: { $in: ids } },
            { $set: { playPauseStatus } },
            { upsert: true });
    }

    async removeDeletedOrganization(ids): Promise<any> {
        return await this.employeesModel.updateMany({ _id: { $in: ids } },
            { $unset: {organization: 1}},
            { upsert: true });
    }

    async removeDeletedPropertiesFromEmployees(employee, propertyId): Promise<any> {
        return await this.employeesModel.updateMany({ _id: employee._id },
            { $pull: { property: { $in: propertyId } } },
            { upsert: true });
    }

    async deleteEmployee(employeeId: string) {
        return await this.employeesModel.deleteOne({ _id: employeeId }).exec();
    }

    async deleteEmployees(employeesIds): Promise<any> {
        const { ids } = employeesIds;
        return await this.employeesModel.deleteMany({ _id: { $in: ids } });
    }

    async findEmployee(id: string, userId: string): Promise<Employees> {
        let employee;
        try {
            employee = await this.employeesModel.findOne({_id: id, authorId: userId}).exec();
        } catch (error) {
            throw new NotFoundException('Could not find employee.');
        }
        if (!employee) {
            throw new NotFoundException('Could not find employee.');
        }
        return employee;
    }
}
