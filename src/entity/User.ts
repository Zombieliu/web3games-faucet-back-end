import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class User {

    @PrimaryColumn()
    id!: string;

    @Column()
    ip!: string;

    @Column()
    country!: string;

    @Column()
    city!: string;

    @Column()
    update_time!: string;

}
