import * as mongoose from 'mongoose';

export const RulesSchema = new mongoose.Schema({
    keyword: String,
    category: {
        type: String,
        enum: ['from', 'to', 'attachments', 'subject', 'body'],
    },
    isIgnore: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    matching: {
        type: String,
        enum: ['Strict', 'ContainsCaseSensitive', 'ContainsCaseInsensitive', 'Regex'],
        default: 'ContainsCaseInsensitive',
    },
    isDeleted: { type: Boolean, default: false },
});

export interface Rules extends mongoose.Document {
    id: string;
    keyword: string;
    category: string;
    isIgnore: boolean;
    isActive: boolean;
    matching: string;
    isDeleted: boolean;
}
