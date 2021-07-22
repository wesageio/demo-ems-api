import * as mongoose from 'mongoose';

export const EmployeesSchema = new mongoose.Schema({
    firstName: String,
    surname: String,
    dateOfBirth: Date,
    email: String,
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Socks' },
    property: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Properties' }],
    workingStatus: { type: Boolean, default: false },
    // playPauseMessage: { type: String, default: 'Paused' },
    // playPauseStatus: { type: Boolean, default: false },
    // isError: { type: Boolean, default: false },
    // comments: String,
    // fetched: String,
    // sentEmailsCount: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'addedOn' } });

export interface Employees extends mongoose.Document {
    firstName: string;
    surname: string;
    dateOfBirth: Date;
    email: string;
    gender: string;
    organization: any;
    property: any;
    workingStatus: boolean;
    // playPauseMessage: string;
    // playPauseStatus: boolean;
    // isError: boolean;
    // status: boolean;
    // comments: string;
    // fetched: string;
    // startAction: boolean;
    // sentEmailsCount: number;
}
