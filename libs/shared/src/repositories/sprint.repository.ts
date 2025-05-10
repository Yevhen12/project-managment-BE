import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { SprintRepositoryInterface } from '../interfaces/entities.interface.repository';
import { SprintEntity } from '../entities/sprint.entity';

@Injectable()
export class SprintRepository
  extends BaseAbstractRepository<SprintEntity>
  implements SprintRepositoryInterface
{
  constructor(
    @InjectRepository(SprintEntity)
    private readonly SprintRepository: Repository<SprintEntity>,
  ) {
    super(SprintRepository);
  }
}
