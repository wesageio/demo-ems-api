import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { EmployeesModule } from '../employees/employees.module';
import { FileManagerModule } from '../common/fileManager/FileManager.module';
import { PropertiesSchema , Properties } from './schemas/properties.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Properties.name, schema: PropertiesSchema }]),
        FileManagerModule,
        forwardRef(() => EmployeesModule),
    ],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})

export class PropertiesModule { }
