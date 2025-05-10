import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => UserEntity, { eager: true }) // ← щоб одразу підтягувався user
  @JoinColumn({ name: 'authorId' }) // ← звʼязуємо з колонкою
  author: UserEntity;

  @Column()
  authorId: string;

  @ManyToOne(() => TaskEntity, (task) => task.comments, { onDelete: 'CASCADE' })
  task: TaskEntity;

  @CreateDateColumn()
  createdAt: Date;
}
