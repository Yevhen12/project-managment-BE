import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';
import { PROJECT_ROLES } from '../constants/enums';
import { UserEntity } from './user.entity';

@Entity('team_members')
export class TeamMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: PROJECT_ROLES,
  })
  role: PROJECT_ROLES;

  @ManyToOne(() => ProjectEntity, (project) => project.teamMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity;

  @Column()
  projectId: string;

  @CreateDateColumn()
  joinedAt: Date;
}
