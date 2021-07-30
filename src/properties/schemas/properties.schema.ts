import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export const attachmentsSchema = new mongoose.Schema({
    fileName: String,
    data: String,
    type: String,
    realFileName: String,
    s3PresignedUrl: String,
});

export type PropertiesDocument = Properties & Document;

@Schema()
export class Properties {
    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String})
    description: string;

    @Prop({
        type: String,
        enum: [
            'Furniture',
            'Telephone',
            'Laptop',
            'Monitor',
            'PC',
            'Keyboard',
            'Mouse',
        ],
    })
    category: string;

    @Prop({type: Date})
    purchaseDate: Date;

    @Prop({type: Number})
    warranty: number;

    @Prop({type: Number})
    purchaseCost: number;

    @Prop({
        type: String,
        enum: ['Active', 'Reparation', 'Broken', 'Archived'],
    })
    status: string;

    @Prop({type: [attachmentsSchema]})
    attachments: object[];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Users'})
    authorId: any;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const PropertiesSchema = SchemaFactory.createForClass(Properties);
