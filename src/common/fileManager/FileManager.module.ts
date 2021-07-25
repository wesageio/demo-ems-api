import { Module } from '@nestjs/common';

import { IFileManager } from './IFileManager.interface';
import { HdfsFileManagerService } from './HdfsFileManager.service';
import { S3FileManagerService } from './S3FileManager.service';

@Module({
    providers: [
        {
            provide: IFileManager,
            useClass:
                process.env.FILE_MANAGER === 'HDFS'
                    ? HdfsFileManagerService
                    : S3FileManagerService,
        },
    ],
    exports: [IFileManager],
})

export class FileManagerModule { }
