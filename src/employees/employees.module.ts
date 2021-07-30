import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesSchema, Employees } from './schemas/employees.schema';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employees.name, schema: EmployeesSchema }]),
    forwardRef(() => PropertiesModule),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
