import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertiesSchema } from './properties.model';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Properties', schema: PropertiesSchema }]),
    EmployeesModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}