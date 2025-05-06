import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedRolesEnum1723893714793 implements MigrationInterface {
  name = 'ChangedRolesEnum1723893714793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Видаляємо стару колонку "name"
    await queryRunner.query(
      `ALTER TABLE "application_roles" DROP COLUMN "name"`,
    );

    // Створюємо новий ENUM тип
    await queryRunner.query(
      `CREATE TYPE "public"."application_roles_name_enum" AS ENUM('JiraAdmin', 'JiraUser', 'JiraManager')`,
    );

    // Додаємо колонку "name" з новим ENUM типом
    await queryRunner.query(
      `ALTER TABLE "application_roles" ADD "name" "public"."application_roles_name_enum"`,
    );

    // Оновлюємо існуючі записи, задаючи дефолтне значення
    await queryRunner.query(
      `UPDATE "application_roles" SET "name" = 'JiraUser' WHERE "name" IS NULL`,
    );

    // Робимо колонку NOT NULL після того, як оновили всі значення
    await queryRunner.query(
      `ALTER TABLE "application_roles" ALTER COLUMN "name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Відкочуємо зміни
    await queryRunner.query(
      `ALTER TABLE "application_roles" DROP COLUMN "name"`,
    );
    await queryRunner.query(`DROP TYPE "public"."application_roles_name_enum"`);
    await queryRunner.query(
      `ALTER TABLE "application_roles" ADD "name" character varying NOT NULL`,
    );
  }
}
