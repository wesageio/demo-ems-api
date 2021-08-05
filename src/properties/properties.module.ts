import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { EmployeesModule } from '../employees/employees.module';
import { FileManagerModule } from '../common/fileManager/FileManager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Properties } from './schemas/properties.entity';
import { Queries } from '../employees/customQueries/queries';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([Properties]),
        // MongooseModule.forFeature([{ name: Properties.name, schema: PropertiesSchema }]),
        FileManagerModule,
        forwardRef(() => EmployeesModule),
    ],
    controllers: [PropertiesController],
    providers: [PropertiesService, Queries],
    exports: [PropertiesService],
})

export class PropertiesModule { }
