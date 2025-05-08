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
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/enums';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: TASK_STATUSES })
  status: TASK_STATUSES;

  @Column({ type: 'enum', enum: TASK_PRIORITIES })
  priority: TASK_PRIORITIES;

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
