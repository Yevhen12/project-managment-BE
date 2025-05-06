import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SprintEntity } from './sprint.entity';
import { TaskEntity } from './task.entity';
import { TeamMemberEntity } from './team-member.entity';
import { InviteEntity } from './invite.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TeamMemberEntity, (member) => member.project)
  teamMembers: TeamMemberEntity[];

  @OneToMany(() => InviteEntity, (invite) => invite.project)
  invites: InviteEntity[];

  @OneToMany(() => SprintEntity, (sprint) => sprint.project)
  sprints: SprintEntity[];

  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks: TaskEntity[];
}
