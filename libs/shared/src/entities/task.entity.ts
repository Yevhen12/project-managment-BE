import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ProjectEntity } from './project.entity';
import { SprintEntity } from './sprint.entity';
import { CommentEntity } from './comment.entity';
import { AttachmentEntity } from './attachment.entity';
import { LabelEntity } from './label.entity';

export enum TaskStatus {
  TODO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  QA_READY = 'QA_READY',
  QA_TESTING = 'QA_TESTING',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: TaskStatus })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority })
  priority: TaskPriority;

  @Column()
  assignee: string;

  @Column()
  reporter: string;

  @Column()
  estimate: number;

  @Column({ default: 0 })
  loggedTime: number;

  @ManyToOne(() => ProjectEntity, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  project: ProjectEntity;

  @ManyToOne(() => SprintEntity, (sprint) => sprint.tasks, { nullable: true })
  sprint: SprintEntity;

  @ManyToMany(() => LabelEntity)
  @JoinTable()
  labels: LabelEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.task)
  comments: CommentEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.task)
  attachments: AttachmentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
