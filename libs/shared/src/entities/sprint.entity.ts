import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';
import { TaskEntity } from './task.entity';

@Entity('sprints')
export class SprintEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => ProjectEntity, (project) => project.sprints, {
    onDelete: 'CASCADE',
  })
  project: ProjectEntity;

  @OneToMany(() => TaskEntity, (task) => task.sprint)
  tasks: TaskEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
