import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { TeamMemberRepositoryInterface } from '../interfaces/entities.interface.repository';
import { TeamMemberEntity } from '../entities/team-member.entity';

@Injectable()
export class TeamMemberRepository
  extends BaseAbstractRepository<TeamMemberEntity>
  implements TeamMemberRepositoryInterface
{
  constructor(
    @InjectRepository(TeamMemberEntity)
    private readonly TeamMemberRepository: Repository<TeamMemberEntity>,
  ) {
    super(TeamMemberRepository);
  }
}
