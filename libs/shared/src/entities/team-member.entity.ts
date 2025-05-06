import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';

export enum ProjectRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  TESTER = 'tester',
}

@Entity('team_members')
export class TeamMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ProjectRole,
  })
  role: ProjectRole;

  @ManyToOne(() => ProjectEntity, (project) => project.teamMembers, {
    onDelete: 'CASCADE',
  })
  project: ProjectEntity;

  @CreateDateColumn()
  joinedAt: Date;
}
