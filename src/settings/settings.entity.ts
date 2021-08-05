import { Entity, ObjectIdColumn, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('settings')
export class Settings {
    @ObjectIdColumn()
    _id: string;

    @PrimaryColumn()
    id: string;

    @Column()
    maxAttachmentSize: number;

    @Column()
    defaultNumberOfEmployees: number;

    @Column()
    defaultNumberOfEquipments: number;

    @Column()
    defaultNumberOfOrganizations: number;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
}
