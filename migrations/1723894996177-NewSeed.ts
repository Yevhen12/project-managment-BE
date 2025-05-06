import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewSeed1723894996178 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "task_status" (name) VALUES 
      ('To Do'),
      ('In Progress'),
      ('Done'),
      ('Blocked');
    `);

    await queryRunner.query(`
      INSERT INTO "task_type" (name) VALUES 
      ('Bug'),
      ('Story'),
      ('Epic'),
      ('Task');
    `);

    // Вставка з ENUM
    await queryRunner.query(`
      INSERT INTO "application_roles" (name) VALUES 
      ('JiraAdmin'),
      ('JiraUser'),
      ('JiraManager');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "task_status" WHERE name IN ('To Do', 'In Progress', 'Done', 'Blocked');`,
    );

    await queryRunner.query(
      `DELETE FROM "task_type" WHERE name IN ('Bug', 'Story', 'Epic', 'Task');`,
    );

    await queryRunner.query(
      `DELETE FROM "application_roles" WHERE name IN ('JiraAdmin', 'JiraUser', 'JiraManager');`,
    );
  }
}
