import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';
import { INVITE_STATUSES } from '../constants/enums';

@Entity('invites')
export class InviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  sentBy: string; // userId хто запросив

  @Column({
    type: 'enum',
    enum: INVITE_STATUSES,
    default: INVITE_STATUSES.PENDING,
  })
  status: INVITE_STATUSES;

  @Column()
  role: string; // developer, admin і т.д.

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.invites, {
    onDelete: 'CASCADE',
  })
  project: ProjectEntity;
}
