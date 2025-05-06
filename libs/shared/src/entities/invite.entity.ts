import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('invites')
export class InviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  sentBy: string; // userId

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ProjectEntity, (project) => project.invites, {
    onDelete: 'CASCADE',
  })
  project: ProjectEntity;
}
