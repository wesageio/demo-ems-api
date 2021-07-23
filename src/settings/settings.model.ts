import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
    maxAttachmentSize: { type: Number },
    defaultNumberOfEmployees: { type: Number },
    defaultNumberOfEquipments: { type: Number },
    defaultNumberOfOrganizations: { type: Number },
});

export interface Settings extends mongoose.Document {
    maxAttachmentSize: number;
    defaultNumberOfEmployees: number;
    defaultNumberOfEquipments: number;
    defaultNumberOfOrganizations: number;
}
