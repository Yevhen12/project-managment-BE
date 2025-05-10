import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { AttachmentRepositoryInterface } from '../interfaces/entities.interface.repository';
import { AttachmentEntity } from '../entities/attachment.entity';

@Injectable()
export class AttachmentRepository
  extends BaseAbstractRepository<AttachmentEntity>
  implements AttachmentRepositoryInterface
{
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly AttachmentRepository: Repository<AttachmentEntity>,
  ) {
    super(AttachmentRepository);
  }
}
