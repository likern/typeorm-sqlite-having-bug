import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'tags'})
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  label: string;
}
