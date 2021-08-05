import { IFileManager } from './IFileManager.interface';
import { NotFoundException } from '@nestjs/common/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3();

@Injectable()
export class S3FileManagerService implements IFileManager {
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
                        const fileUuid = uuidv4();
                        const bufferData = Buffer.from(file.data, 'base64');
                        const params = {
                            Bucket: process.env.FILE_MANAGER_S3_BUCKET,
                            Key: process.env.FILE_MANAGER_S3_FOLDER + fileUuid,
                            Body: bufferData,
                            ContentEncoding: 'base64',
                            ContentType: `image/${this.getType(file.type)}`,
                        };

                        s3.putObject(params, (err, data) => {
                            if (err) {
                                console.log('Error: ', err);
                            } else {
                                resolve({
                                    fileName: fileUuid,
                                    type: this.getType(file.type),
                                    realFileName: file.fileName,
                                });
                            }
                        });
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
        const promises = files.map((file) => {
            if (file) {
                return new Promise((resolve, reject) => {
                    const url = s3.getSignedUrl('getObject', {
                        Bucket: process.env.FILE_MANAGER_S3_BUCKET,
                        Key: process.env.FILE_MANAGER_S3_FOLDER + file.fileName,
                        Expires: Number(process.env.FILE_MANAGER_S3_URL_EXPIRE_TIMEOUT),
                    });
                    resolve({
                        _id: file.id,
                        fileName: file.fileName,
                        type: file.type,
                        realFileName: file.fileName,
                        s3PresignedUrl: url,
                    });
                });
            }
        });
        const res = await Promise.all(promises);
        return res;
    }
}
