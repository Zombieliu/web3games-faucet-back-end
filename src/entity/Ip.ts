import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Ip {

    @PrimaryColumn()
    id!: string;

    @Column()
    country!: string;

    @Column()
    city!: string;

    @Column()
    address!: string;

}
