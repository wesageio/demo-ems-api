import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type EmployeesDocument = Employees & Document;

@Schema()
export class Employees {
    @Prop({type: String, required: true})
    firstName: string;

    @Prop({type: String, required: true})
    surname: string;

    @Prop()
    dateOfBirth: Date;

    @Prop({type: String, required: true})
    email: string;

    @Prop({
        type: String,
        enum: ['male', 'female'],
        required: true,
    })
    gender: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Organizations'})
    organization: any;

    @Prop([{type: mongoose.Schema.Types.ObjectId, ref: 'Properties'}])
    property: any;

    @Prop({type: Boolean, default: true})
    workingStatus: boolean;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Users'})
    authorId: any;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const EmployeesSchema = SchemaFactory.createForClass(Employees);
