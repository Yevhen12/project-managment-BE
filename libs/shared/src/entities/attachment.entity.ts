import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  fileName: string;

  @Column()
  uploadedBy: string;

  @ManyToOne(() => TaskEntity, (task) => task.attachments, {
    onDelete: 'CASCADE',
  })
  task: TaskEntity;

  @CreateDateColumn()
  createdAt: Date;
}
