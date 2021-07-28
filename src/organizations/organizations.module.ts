import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationsSchema } from './organizations.model';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Organizations', schema: OrganizationsSchema }]),
    EmployeesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
