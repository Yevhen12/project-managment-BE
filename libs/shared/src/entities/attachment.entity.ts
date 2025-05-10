import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string; // посилання на файл у S3

  @Column()
  fileName: string; // оригінальна назва файлу

  @Column()
  uploadedBy: string; // userId того, хто завантажив

  @ManyToOne(() => TaskEntity, (task) => task.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' }) // Явно вказуємо FK
  task: TaskEntity;

  @Column()
  taskId: string; // <-- потрібно явно, щоб мати доступ до taskId без джойна

  @CreateDateColumn()
  createdAt: Date;
}
