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
  JoinColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';
import { SprintEntity } from './sprint.entity';
import { CommentEntity } from './comment.entity';
import { AttachmentEntity } from './attachment.entity';
import { LabelEntity } from './label.entity';
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES } from '../constants/enums';
import { UserEntity } from './user.entity';
import { WorkLogEntity } from './work-log.entity';

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

  @ManyToOne(() => UserEntity, { eager: true }) // або через relations у запиті
  @JoinColumn({ name: 'assigneeId' })
  assignee: UserEntity;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'reporterId' })
  reporter: UserEntity;

  @Column({ nullable: true })
  reporterId: string;

  @Column()
  estimate: number;

  @Column({ default: 0 })
  loggedTime: number;

  @Column({ type: 'enum', enum: TASK_TYPES })
  type: TASK_TYPES;

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

  @OneToMany(() => WorkLogEntity, (workLog) => workLog.task)
  workLogs: WorkLogEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
