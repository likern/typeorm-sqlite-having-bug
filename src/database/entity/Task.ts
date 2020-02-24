import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import {Tag} from './Tag';

@Entity({name: 'tasks'})
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @ManyToMany(type => Tag, {eager: true})
  @JoinTable()
  tags: Tag[];
}
