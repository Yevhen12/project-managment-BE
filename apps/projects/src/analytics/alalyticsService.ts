import {
  TaskRepositoryInterface,
  SprintRepositoryInterface,
  TeamMemberRepositoryInterface,
  TASK_STATUSES,
} from '@/shared';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('TaskRepositiryInterface')
    private readonly taskRepository: TaskRepositoryInterface,
    @Inject('SprintRepositiryInterface')
    private readonly sprintRepository: SprintRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
  ) {}

  async getAdminAnalytics(projectId: string) {
    const [tasks, sprints, members] = await Promise.all([
      this.taskRepository.findAll({
        where: { project: { id: projectId } },
        relations: ['assignee', 'sprint'],
      }),
      this.sprintRepository.findAll({ where: { project: { id: projectId } } }),
      this.teamMemberRepository.findAll({
        where: { project: { id: projectId } },
        relations: ['user'],
      }),
    ]);

    // Team Productivity
    const teamProductivity = members.map((member) => {
      const userTasks = tasks.filter((t) => t.assignee?.id === member.user.id);
      const created = userTasks.length;
      const doneTasks = userTasks.filter(
        (t) => t.status === TASK_STATUSES.DONE,
      );
      const done = doneTasks.length;

      const overdue = doneTasks.filter((t) => t.loggedTime > t.estimate).length;

      const avgTime =
        doneTasks.length > 0
          ? parseFloat(
              (
                doneTasks.reduce((acc, t) => {
                  const createdAt = new Date(t.createdAt).getTime();
                  const completedAt = new Date(t.updatedAt).getTime();
                  return acc + (completedAt - createdAt);
                }, 0) /
                doneTasks.length /
                (1000 * 60 * 60 * 24)
              ).toFixed(1),
            )
          : 0;

      return {
        user: `${member.user.firstName} ${member.user.lastName}`,
        created,
        done,
        avgTime,
        overdue,
      };
    });

    // Sprint Activity
    const sprintActivity = sprints.map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprint?.id === sprint.id);

      const added = sprintTasks.length;
      const completed = sprintTasks.filter(
        (t) => t.status === TASK_STATUSES.DONE,
      ).length;

      const rate = added > 0 ? Math.round((completed / added) * 100) : 0;

      return {
        id: sprint.id,
        name: sprint.name,
        added,
        completed,
        rate,
      };
    });

    // Longest Tasks
    const longestTasks = tasks
      .map((task) => {
        const created = new Date(task.createdAt);
        const updated = new Date(task.updatedAt);
        const daysActive = Math.ceil(
          (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: task.id,
          title: task.title,
          assignee: task.assignee
            ? `${task.assignee.firstName} ${task.assignee.lastName}`
            : '—',
          daysActive,
          status: task.status,
        };
      })
      .sort((a, b) => b.daysActive - a.daysActive)
      .slice(0, 5);

    // Member Workload
    const memberWorkload = members.map((member) => {
      const userTasks = tasks.filter((t) => t.assignee?.id === member.user.id);
      const estimated = userTasks.reduce(
        (acc, t) => acc + (t.estimate || 0),
        0,
      );
      const logged = userTasks.reduce((acc, t) => acc + (t.loggedTime || 0), 0);

      return {
        name: `${member.user.firstName} ${member.user.lastName}`,
        estimated,
        logged,
      };
    });

    // Overdue Tasks
    const overdueTasks = teamProductivity
      .filter((tp) => tp.overdue > 0)
      .map(({ user, overdue }) => ({ name: user, overdue }));

    return {
      teamProductivity,
      sprintActivity,
      longestTasks,
      memberWorkload,
      overdueTasks,
    };
  }
  async getDeveloperAnalytics(projectId: string, userId: string): Promise<any> {
    const [tasks, activeSprint] = await Promise.all([
      this.taskRepository.findAll({
        where: {
          project: { id: projectId },
          assignee: { id: userId },
        },
        relations: ['sprint'],
      }),
      this.sprintRepository.findByCondition({
        where: {
          project: { id: projectId },
          isActive: true,
        },
      }),
    ]);

    const myTasks = tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      estimate: t.estimate,
      loggedTime: t.loggedTime,
    }));

    let mySprintProgress = null;
    if (activeSprint) {
      const sprintTasks = tasks.filter(
        (t) => t.sprint && t.sprint.id === activeSprint.id,
      );

      if (sprintTasks.length > 0) {
        const assigned = sprintTasks.length;
        const done = sprintTasks.filter(
          (t) => t.status === TASK_STATUSES.DONE,
        ).length;
        const inProgress = sprintTasks.filter(
          (t) => t.status === TASK_STATUSES.IN_PROGRESS,
        ).length;

        mySprintProgress = {
          sprintName: activeSprint.name,
          assigned,
          done,
          inProgress,
        };
      }
    }

    const estimateVsLogged = tasks.map((t) => ({
      taskId: t.id,
      estimate: t.estimate,
      logged: t.loggedTime,
      diff: (t.estimate || 0) - (t.loggedTime || 0),
    }));

    const priorityDist = { Low: 0, Medium: 0, High: 0 };
    tasks.forEach((t) => {
      if (priorityDist[t.priority] !== undefined) {
        priorityDist[t.priority]++;
      }
    });
    console.log({ tasks });

    const statusDist = { todo: 0, inProgress: 0, done: 0 };
    tasks.forEach((t) => {
      if (t.status.toLowerCase() === TASK_STATUSES.TODO.toLowerCase())
        statusDist.todo++;
      else if (
        t.status.toLowerCase() === TASK_STATUSES.IN_PROGRESS.toLowerCase()
      )
        statusDist.inProgress++;
      else if (t.status.toLowerCase() === TASK_STATUSES.DONE.toLowerCase())
        statusDist.done++;
    });

    return {
      myTasks,
      mySprintProgress,
      estimateVsLogged,
      priorityDistribution: priorityDist,
      statusBreakdown: statusDist,
    };
  }
}
