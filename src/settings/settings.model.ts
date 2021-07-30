import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
    maxAttachmentSize: { type: Number },
    defaultNumberOfEmployees: { type: Number, default: 5 },
    defaultNumberOfEquipments: { type: Number, default: 5 },
    defaultNumberOfOrganizations: { type: Number, default: 5 },
});

export interface Settings extends mongoose.Document {
    maxAttachmentSize: number;
    defaultNumberOfEmployees: number;
    defaultNumberOfEquipments: number;
    defaultNumberOfOrganizations: number;
}
