import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

@Entity('work_logs')
export class WorkLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  timeSpent: number;

  @Column({ type: 'date' })
  workDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column() // ця колонка створюється явно
  userId: string;

  @ManyToOne(() => TaskEntity, (task) => task.workLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: TaskEntity;

  @Column()
  taskId: string;
}
