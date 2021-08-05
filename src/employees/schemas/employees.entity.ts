import { Entity, ObjectIdColumn, ObjectID, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Properties } from '../../properties/schemas/properties.entity';

enum Gender {
    Male = 'male',
    Female = 'female',
}

@Entity('employees')
export class Employees {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    firstName: string;

    @Column()
    surname: string;

    @Column()
    dateOfBirth: Date;

    @Column()
    email: string;

    @Column('text')
    gender: Gender;

    @Column()
    property: string[];

    @Column()
    organization: string;

    @Column('boolean')
    workingStatus: true | false;

    @Column()
    authorId: string;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
}
