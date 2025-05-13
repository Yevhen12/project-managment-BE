import {
  ProjectRepositoryInterface,
  TeamMemberRepositoryInterface,
  InviteRepositoryInterface,
  USERS_SERVICE,
  LabelEntity,
  SprintEntity,
  TaskEntity,
  TaskRepositoryInterface,
  UserEntity,
  WorkLogRepositoryInterface,
  CommentRepositoryInterface,
  CommentEntity,
  AttachmentRepositoryInterface,
  extractKeyFromUrl,
  AttachmentEntity,
} from '@/shared';
import { AddCommentDto } from '@/shared/dtos/projects/AddComment.dto';
import { AddWorkLogDto } from '@/shared/dtos/projects/AddWorkLog.dto';
import { CreateTaskDto } from '@/shared/dtos/projects/CreateTask.dto';
import { UpdateTaskDto } from '@/shared/dtos/projects/UpdateTask.dto';
import { AwsS3Service } from '@/shared/services/aws-s3.service';
import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class TasksService {
  constructor(
    @Inject('ProjectRepositoryInterface')
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
    @Inject('InviteRepositiryInterface')
    private readonly inviteRepositiry: InviteRepositoryInterface,
    @Inject('TaskRepositiryInterface')
    private readonly taskRepository: TaskRepositoryInterface,
    @Inject('WorkLogRepositiryInterface')
    private readonly workLogRepository: WorkLogRepositoryInterface,
    @Inject('CommentRepositiryInterface')
    private readonly commentRepository: CommentRepositoryInterface,
    @Inject('AttachmentRepositiryInterface')
    private readonly attachmentRepository: AttachmentRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
    private readonly aswS3Service: AwsS3Service,
  ) {}

  async createTask(
    dto: CreateTaskDto & { reporter: string },
  ): Promise<TaskEntity> {
    const {
      title,
      description,
      status,
      priority,
      type,
      assignee,
      estimate,
      sprintId,
      labelIds = [],
      projectId,
      reporter,
    } = dto;

    const project = await this.projectRepository.findOneById(projectId);
    if (!project) {
      throw new RpcException(new NotFoundException('Project not found'));
    }

    const assigneeIsMember = await this.teamMemberRepository.findByCondition({
      where: { userId: assignee, project: { id: projectId } },
    });

    if (!assigneeIsMember) {
      throw new RpcException(
        new ForbiddenException('Assignee is not a member of this project'),
      );
    }

    const task = this.taskRepository.create({
      title,
      description,
      status,
      priority,
      type,
      assignee: { id: assignee },
      reporter: { id: reporter },
      estimate,
      project,
    });

    if (sprintId) {
      task.sprint = { id: sprintId } as SprintEntity;
    }

    if (labelIds?.length) {
      task.labels = labelIds.map((id) => ({ id })) as LabelEntity[];
    }

    const saved = await this.taskRepository.save(task);

    return await this.taskRepository.findByCondition({
      where: { id: saved.id },
      relations: [
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
        'workLogs',
        'workLogs.user', // додано
      ],
    });
  }

  async getAllTasksForProject(projectId: string): Promise<TaskEntity[]> {
    return this.taskRepository.findAll({
      where: { project: { id: projectId } },
      relations: [
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
        'workLogs',
        'workLogs.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserTasksInProject(
    projectId: string,
    userId: string,
  ): Promise<TaskEntity[]> {
    return this.taskRepository.findAll({
      where: {
        project: { id: projectId },
        assignee: { id: userId },
      },
      relations: [
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
        'workLogs',
        'workLogs.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTask(
    dto: UpdateTaskDto & { id: string; reporter?: string },
  ): Promise<TaskEntity> {
    const {
      id,
      title,
      description,
      status,
      priority,
      type,
      assignee,
      estimate,
      sprintId,
      labelIds,
      projectId,
      reporter,
      loggedTime,
    } = dto;

    const task = await this.taskRepository.findByCondition({
      where: { id },
      relations: ['project', 'sprint', 'assignee', 'reporter', 'labels'],
    });

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    if (projectId) {
      const project = await this.projectRepository.findOneById(projectId);
      if (!project) {
        throw new RpcException(new NotFoundException('Project not found'));
      }
      task.project = project;
    }

    if (assignee) {
      const assigneeIsMember = await this.teamMemberRepository.findByCondition({
        where: { userId: assignee, project: { id: task.project.id } },
      });

      if (!assigneeIsMember) {
        throw new RpcException(
          new ForbiddenException('Assignee is not a member of this project'),
        );
      }

      task.assignee = { id: assignee } as UserEntity;
    }

    if (reporter) {
      task.reporter = { id: reporter } as UserEntity;
    }

    if (sprintId) {
      task.sprint = { id: sprintId } as SprintEntity;
    }

    if (labelIds) {
      task.labels = labelIds.map((id) => ({ id })) as LabelEntity[];
    }

    Object.assign(task, {
      title: title ?? task.title,
      description: description ?? task.description,
      status: status ?? task.status,
      priority: priority ?? task.priority,
      type: type ?? task.type,
      estimate: estimate ?? task.estimate,
      loggedTime: loggedTime ?? task.loggedTime,
    });

    await this.taskRepository.save(task);

    // 🔄 Повторне отримання для повернення повністю зв'язаної таски
    return await this.taskRepository.findByCondition({
      where: { id },
      relations: [
        'project',
        'sprint',
        'assignee',
        'reporter',
        'labels',
        'workLogs',
        'workLogs.user', // додано
      ],
    });
  }
  async deleteTask(id: string): Promise<{ success: boolean }> {
    const task = await this.taskRepository.findOneById(id);

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    await this.taskRepository.remove(task);

    return { success: true };
  }

  async getTaskById(taskId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: [
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
        'comments',
        'comments.author',
        'attachments',
        'workLogs',
        'workLogs.user',
      ],
    });

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    return task;
  }

  async addWorkLog(userId: string, dto: AddWorkLogDto): Promise<TaskEntity> {
    const { taskId, timeSpent, workDate } = dto;

    const task = await this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: [
        'workLogs',
        'workLogs.user',
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
      ],
    });

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    const workLog = this.workLogRepository.create({
      timeSpent,
      workDate: new Date(workDate),
      user: { id: userId } as any,
      task: task, // ← саме передаємо ПОВНУ сутність task
    });

    await this.workLogRepository.save(workLog); // ← важливо зберегти перед task.loggedTime

    await this.taskRepository.update(task.id, {
      loggedTime: (task.loggedTime || 0) + timeSpent,
    });

    return this.taskRepository.findByCondition({
      where: { id: task.id },
      relations: [
        'workLogs',
        'workLogs.user',
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
      ],
    });
  }

  async addComment(userId: string, dto: AddCommentDto): Promise<TaskEntity> {
    const { taskId, content } = dto;

    const task = await this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: ['comments', 'comments.author', 'assignee', 'project'],
    });

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    console.log({ content, taskId });
    const comment = this.commentRepository.create({
      content,
      task,
      author: { id: userId } as any,
    });

    await this.commentRepository.save(comment);

    return this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: ['comments', 'comments.author', 'assignee', 'project'],
    });
  }

  async getTaskComments(taskId: string): Promise<CommentEntity[]> {
    const task = await this.taskRepository.findOneById(taskId);

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    return this.commentRepository.findAll({
      where: { task: { id: taskId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async addAttachment(
    taskId: string,
    file: any,
    userId: string,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: ['attachments'],
    });

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    const fileUrl = await this.aswS3Service.uploadFile(file); // <-- повертає публічний URL

    const attachment = this.attachmentRepository.create({
      url: fileUrl,
      fileName: file.originalname,
      uploadedBy: userId,
      task,
    });

    await this.attachmentRepository.save(attachment);

    return this.taskRepository.findByCondition({
      where: { id: taskId },
      relations: [
        'attachments',
        'attachments.task',
        'assignee',
        'reporter',
        'project',
        'labels',
        'sprint',
      ],
    });
  }

  async deleteAttachment(
    attachmentId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const attachment = await this.attachmentRepository.findOneById(
      attachmentId,
    );

    if (!attachment) {
      throw new RpcException(new NotFoundException('Attachment not found'));
    }

    if (attachment.uploadedBy !== userId) {
      throw new RpcException(
        new ForbiddenException('Not allowed to delete this file'),
      );
    }

    const key = extractKeyFromUrl(attachment.url);
    await this.aswS3Service.deleteFile(key);
    await this.attachmentRepository.remove(attachment);

    return { success: true, message: 'Attachment deleted successfully' };
  }

  async getTaskAttachments(taskId: string): Promise<AttachmentEntity[]> {
    const task = await this.taskRepository.findOneById(taskId);

    if (!task) {
      throw new RpcException(new NotFoundException('Task not found'));
    }

    return this.attachmentRepository.findAll({
      where: { task: { id: taskId } },
      order: { createdAt: 'DESC' },
    });
  }
}
