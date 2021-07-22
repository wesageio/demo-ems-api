import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesSchema } from './employees.model';
import { PropertiesModule } from '../properties/properties.module';
import { AppGateway } from '../app.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Employees', schema: EmployeesSchema }]),
    forwardRef(() => PropertiesModule),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, AppGateway],
  exports: [EmployeesService],
})
export class EmployeesModule {}
