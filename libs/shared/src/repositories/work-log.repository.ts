import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { WorkLogRepositoryInterface } from '../interfaces/entities.interface.repository';
import { WorkLogEntity } from '../entities/work-log.entity';

@Injectable()
export class WorkLogRepository
  extends BaseAbstractRepository<WorkLogEntity>
  implements WorkLogRepositoryInterface
{
  constructor(
    @InjectRepository(WorkLogEntity)
    private readonly WorkLogRepository: Repository<WorkLogEntity>,
  ) {
    super(WorkLogRepository);
  }
}
