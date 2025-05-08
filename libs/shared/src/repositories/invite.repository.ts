import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { InviteRepositoryInterface } from '../interfaces/entities.interface.repository';
import { InviteEntity } from '../entities/invite.entity';

@Injectable()
export class InviteRepositiry
  extends BaseAbstractRepository<InviteEntity>
  implements InviteRepositoryInterface
{
  constructor(
    @InjectRepository(InviteEntity)
    private readonly InviteRepository: Repository<InviteEntity>,
  ) {
    super(InviteRepository);
  }
}
