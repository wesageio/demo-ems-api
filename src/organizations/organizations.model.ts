import * as mongoose from 'mongoose';

export const OrganizationsSchema = new mongoose.Schema({
    name: String,
    telephone: String,
    email: String,
    location: String,
    country: String,
    website: String,
    workers: Number,
});

export interface Organizations extends mongoose.Document {
    name: string;
    telephone: string;
    email: string;
    location: string;
    website: string;
    workers: number;
}
