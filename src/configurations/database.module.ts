import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigurationModule } from './config.module';
import { ConfigService } from './config.service';
import { Users } from '../auth/schemas/users.enity';
import { Properties } from '../properties/schemas/properties.entity';
import { Organizations } from '../organizations/schemas/organizations.entity';
import { Employees } from '../employees/schemas/employees.entity';
import { Settings } from '../settings/settings.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigurationModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return ({
                    type: config.databaseType,
                    host: config.databaseHost,
                    port: config.databasePort,
                    database: config.databaseName,
                    entities: [Users, Properties, Organizations, Employees, Settings], // ['src/modules/**/*.entity{.ts,.js}'],
                    migrations: [Users, Properties, Organizations, Employees, Settings], // ['src/modules/**/*.migration{.ts,.js}'],
                    synchronize: false,
                    autoSchemaSync: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                } as TypeOrmModuleOptions);
            },
        }),
    ],
})
export class DatabaseModule { }
