import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SocksController } from './socks.controller';
import { SocksService } from './socks.service';
import { OrganizationsSchema } from './socks.model';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Organizations', schema: OrganizationsSchema }]),
    EmployeesModule,
  ],
  controllers: [SocksController],
  providers: [SocksService],
})
export class SocksModule {}
