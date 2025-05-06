import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  authorId: string;

  @ManyToOne(() => TaskEntity, (task) => task.comments, { onDelete: 'CASCADE' })
  task: TaskEntity;

  @CreateDateColumn()
  createdAt: Date;
}
