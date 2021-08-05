import { Employees } from '../schemas/employees.entity';
import { getMongoRepository } from 'typeorm';

export class Queries {
    async removeDeletedPropertiesFromEmployees(employee, propertyId): Promise<any> {
        const repository = getMongoRepository(Employees);

        return await repository.updateMany({ _id: employee.id },
            { $pull: { property: { $in: propertyId } } },
            { upsert: true });
    }

    async removeDeletedOrganization(employees): Promise<any> {
        const repository = getMongoRepository(Employees);
        const ids = employees.map((item) => {
            return item.id;
        });

        return await repository.updateMany({ _id: { $in: ids } },
            { $unset: {organization: 1}});
    }
}
