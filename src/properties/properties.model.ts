import * as mongoose from 'mongoose';

const attachmentsSchema = new mongoose.Schema({ fileName: String, data: String, type: String, realFileName: String, s3PresignedUrl: String });

export const PropertiesSchema = new mongoose.Schema({
    // serverIp: String,
    name: String,
    category: {
        type: String,
        enum: [
            'Furniture',
            'Telephone',
            'Laptop',
            'Monitor',
            'Pc',
            'Keyboard',
            'Mouse',
        ],
    },
    description: String,
    purchaseDate: Date,
    warranty: Number,
    purchaseCost: Number,
    status: {
        type: String,
        enum: ['Active', 'Reparation', 'BrokenNotFixable', 'Archived'],
    },
    port: Number,
    attachments: [attachmentsSchema],
});

export interface Properties extends mongoose.Document {
    // serverIp: string;
    name: string;
    category: string;
    description: string;
    purchaseDate: Date;
    warranty: number;
    purchaseCost: number;
    status: string;
    port: number;
    attachments: string[];
}
