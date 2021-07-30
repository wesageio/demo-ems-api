import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type OrganizationsDocument = Organizations & Document;

@Schema()
export class Organizations {
    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    telephone: string;

    @Prop({type: String, required: true})
    email: string;

    @Prop({type: String})
    location: string;

    @Prop({type: String})
    website: string;

    @Prop({type: Number})
    workers: number;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Users'})
    authorId: any;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const OrganizationsSchema = SchemaFactory.createForClass(Organizations);
