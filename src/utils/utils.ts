import * as moment from 'moment';
import { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { v4 as uuidv4 } from 'uuid';

import { hdfs } from './hdfs';

export const filterForQuery = (filter: any) => {
    if (filter.hasOwnProperty('q')) {
        return { $where: `JSON.stringify(this).indexOf('${filter.q.charAt(0).toUpperCase() + filter.q.slice(1)}')!=-1` };
    } else {
        Object.keys(filter).map((key: string) => {
            if (!isNaN(filter[key]) && !filter.hasOwnProperty('imapServerIp') &&
                !filter.hasOwnProperty('imapSockIp')) {
                return filter[key];
            } else if (filter.hasOwnProperty('property') ||
                    filter.hasOwnProperty('organization')) {
                return filter;
            } else {
                const date = moment(filter[key], 'YYYY-MM-DD', true);
                if (date.isValid()) {
                    filter[key] = {
                        $gte: moment(filter[key]).format('YYYY-01-01 00:mm:ss:SSS'),
                        $lt: moment(filter[key]).format('YYYY-12-30 24:mm:ss:SSS'),
                    };
                } else {
                    if (filter.hasOwnProperty('imapServerIp')) {
                        filter = { serverIp: { $regex: filter[key], $options: 'i' } };
                        return filter;
                    } else if (filter.hasOwnProperty('imapSockIp')) {
                        filter = { ip: { $regex: filter[key], $options: 'i' } };
                        return filter;
                    } else {
                        filter[key] = { $regex: filter[key], $options: 'i' };
                    }
                }
            }
        });
        return filter;
    }
};

const getType = (extension) => {
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
};

export const writeData = (files) => {
    if (files && files.legnth !== 0) {
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
                            type: getType(file.type),
                            fileName: file.fileName,
                        }));
                });
            } else {
                return file;
            }
        });
        return Promise.all(promises).then((res) => {
            return res;
        }).catch(err => {
            throw new NotFoundException(err);
        });
    } else {
        return null;
    }
};

export const filterDataWithServerId = (data, body) => {
    const arrayOfIds = data.filter((item) => item.serverId && item.serverId !== undefined).map((item) => {
        return item.serverId._id;
    });

    const ids = [...new Set(arrayOfIds)];
    return ids.map((element) => {
        const serverIdGroupData = data.filter((item) => item.serverId !== undefined && item.serverId._id === element);
        return serverIdGroupData.map((item) => {
            if (body) {
                item.playPauseStatus = body.playPauseStatus;
            }
            return item;
        });
    });
};

export const filterSocksImapAccounts = (data) => {
    const arrayOfIds = data.filter((item) => item.serverId && item.serverId !== undefined).map((item) => {
        return item.serverId._id;
    });
    const ids = [...new Set(arrayOfIds)];
    return ids.map((element) => {
        const serverIdGroupData = data.filter((item) => item.serverId !== undefined && item.serverId._id === element);
        const sockImapAccounts = serverIdGroupData.map(item => item._id);
        return {
            serverGroups: serverIdGroupData,
            runImapAccounts: sockImapAccounts,
        };
    });
};
