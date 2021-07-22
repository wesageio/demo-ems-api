import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RulesModule } from './rules/rules.module';
import { EmployeesModule } from './employees/employees.module';
import { SettingsModule } from './settings/settings.module';
import { EmailsModule } from './emails/emails.module';
import { SocksModule } from './socks/socks.module';
import { PropertiesModule } from './properties/properties.module';
import { AppGateway } from './app.gateway';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        UsersModule,
        RulesModule,
        EmployeesModule,
        SocksModule,
        PropertiesModule,
        EmailsModule,
        SettingsModule,
        MongooseModule.forRoot(
            `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            },
        ),
    ],
    controllers: [AppController],
    providers: [AppService, AppGateway],
})
export class AppModule { }
