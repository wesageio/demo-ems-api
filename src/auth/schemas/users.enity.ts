import { Entity, Column, ObjectID, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class Users {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @CreateDateColumn({ nullable: true })
    lastActivity: Date;
}
