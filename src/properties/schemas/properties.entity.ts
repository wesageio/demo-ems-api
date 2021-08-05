import { Column, Entity, CreateDateColumn, ObjectIdColumn, ObjectID, ManyToMany } from 'typeorm';
import { Employees } from '../../employees/schemas/employees.entity';

enum Category {
    Telephone = 'telephone',
    Furniture = 'furniture',
    Laptop = 'laptop',
    Monitor = 'monitor',
    PC = 'pc',
    Keyboard = 'Keyboard',
    Mouse = 'mouse',
}

enum Status {
    Active = 'active',
    Reparation = 'reparation',
    Broken = 'broken',
    Archived = 'archived',
}

@Entity('properties')
export class Properties {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column('text')
    category: Category;

    @Column({ type: 'timestamptz' })
    purchaseDate: Date;

    @Column()
    warranty: number;

    @Column()
    purchaseCost: number;

    @Column('text')
    status: Status;

    @Column()
    attachments: [{
        fileName: string,
        data: string,
        type: string,
        realFileName: string,
        s3PresignedUrl: string,
    }];

    @ManyToMany(type => Employees, employees => employees.property)
    author: Employees;

    @Column()
    authorId: string;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
}
