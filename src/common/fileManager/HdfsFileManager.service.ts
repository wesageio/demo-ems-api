import { IFileManager } from './IFileManager.interface';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import { hdfs } from '../../utils/hdfs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HdfsFileManagerService implements IFileManager {
    private getType = (extension) => {
        switch (extension) {
            case 'image/png':
                return 'png';
            case 'image/jpeg':
                return 'jpeg';
            case 'image/jpg':
                return 'jpg';
            case 'application/pdf':
                return 'pdf';
            case 'text/plain':
                return 'csv';
            case 'text/csv':
                return 'csv';
            default:
                return 'document';
        }
    }

    public async insertFile(files: Array<any>) {
        if (files && files.length !== 0) {
            const promises = files.map(file => {
                if (file.data) {
                    return new Promise((resolve, reject) => {
                        const path = uuidv4();
                        const output = hdfs.writeFile(path);
                        const buffer = Buffer.from(file.data, 'base64');
                        const stream = new Readable();
                        stream.push(buffer);
                        stream.push(null);
                        stream.pipe(output);
                        output.on('error', (err) => reject(err));
                        output.on('finish', () => resolve({
                            path: process.env.HADOOP_PATH + path,
                            type: this.getType(file.type),
                            fileName: file.fileName,
                        }));
                    });
                } else {
                    return file;
                }
            });
            try {
                const res = await Promise.all(promises);
                return res;
            } catch (err) {
                throw new NotFoundException(err);
            }
        } else {
            return null;
        }
    }

    public async getFiles(files: Array<any>) {
        return [];
    }
}
