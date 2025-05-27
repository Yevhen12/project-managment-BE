import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { TaskRepositoryInterface } from '../interfaces/entities.interface.repository';
import { TaskEntity } from '../entities/task.entity';

@Injectable()
export class TaskRepository
  extends BaseAbstractRepository<TaskEntity>
  implements TaskRepositoryInterface
{
  constructor(
    @InjectRepository(TaskEntity)
    private readonly TaskRepository: Repository<TaskEntity>,
  ) {
    super(TaskRepository);
  }
  async updateMany(
    taskIds: string[],
    data: Partial<TaskEntity>,
  ): Promise<void> {
    await this.TaskRepository.createQueryBuilder()
      .update(TaskEntity)
      .set(data)
      .whereInIds(taskIds)
      .execute();
  }
}
