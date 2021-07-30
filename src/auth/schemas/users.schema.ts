import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UsersDocument = Users & Document;

@Schema()
export class Users {
    @Prop({ type: String, required: true })
    username: string;

    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: Date })
    lastAcitivy: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
