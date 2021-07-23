import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { EmailsSchema } from './email.model';
import { AppGateway } from '../app.gateway';
import { EmployeesModule } from '../employees/employees.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Emails', schema: EmailsSchema }]),
    EmployeesModule,
    RulesModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService, AppGateway],
})
export class EmailsModule {}
