import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { ProjectRepositoryInterface } from '../interfaces/entities.interface.repository';
import { ProjectEntity } from '../entities/project.entity';

@Injectable()
export class ProjectRepository
  extends BaseAbstractRepository<ProjectEntity>
  implements ProjectRepositoryInterface
{
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly ProjectRepository: Repository<ProjectEntity>,
  ) {
    super(ProjectRepository);
  }
}
