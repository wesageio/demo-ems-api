import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { SettingsModule } from './settings/settings.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PropertiesModule } from './properties/properties.module';
import { FileManagerModule } from './common/fileManager/FileManager.module';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configurations/config.module';
import { DatabaseModule } from './configurations/database.module';

@Module({
    imports: [
        ConfigurationModule,
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        FileManagerModule,
        PropertiesModule,
        OrganizationsModule,
        EmployeesModule,
        SettingsModule,
        // MongooseModule.forRoot(
        //     `mongodb://${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
        //     {
        //         useNewUrlParser: true,
        //         useUnifiedTopology: true,
        //         useFindAndModify: false,
        //     },
        // ),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
