import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { EmployeesModule } from '../employees/employees.module';
import { OrganizationsSchema , Organizations } from './schemas/organizations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organizations.name, schema: OrganizationsSchema }]),
    EmployeesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
