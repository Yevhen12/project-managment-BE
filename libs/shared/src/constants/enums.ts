export enum APPLICATION_ROLES {
  JIRA_ADMIN = 'JiraAdmin',
  JIRA_USER = 'JiraUser',
  JIRA_MANAGER = 'JiraManager',
}

export enum INVITE_STATUSES {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum TASK_STATUSES {
  TODO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  QA_READY = 'QA_READY',
  QA_TESTING = 'QA_TESTING',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TASK_PRIORITIES {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum PROJECT_ROLES {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  TESTER = 'tester',
}
