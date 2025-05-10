// import { Injectable } from '@nestjs/common';
// import { LessThan } from 'typeorm';
// import { SprintRepositoryInterface } from '@/shared';
// import { Inject } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';

// @Injectable()
// export class SprintCleanupService {
//   constructor(
//     @Inject('SprintRepositoryInterface')
//     private readonly sprintRepository: SprintRepositoryInterface,
//   ) {}

//   @Cron(CronExpression.EVERY_10_MINUTES)
//   async handleExpiredSprints() {
//     const now = new Date();

//     const expiredSprints = await this.sprintRepository.findAll({
//       where: {
//         isActive: true,
//         endDate: LessThan(now),
//       },
//     });

//     for (const sprint of expiredSprints) {
//       sprint.isActive = false;
//       sprint.forcedFinished = false;
//       sprint.completedAt = now;

//       await this.sprintRepository.save(sprint);
//       console.log(`[CRON] Sprint auto-finished: ${sprint.id}`);
//     }
//   }
// }
