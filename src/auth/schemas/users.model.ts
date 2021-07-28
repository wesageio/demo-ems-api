import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: [String], required: true, enum: ['admin', 'another'] },
});

export interface Users extends mongoose.Document {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
}
