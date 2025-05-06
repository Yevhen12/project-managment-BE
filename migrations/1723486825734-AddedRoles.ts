import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedRoles1723486825734 implements MigrationInterface {
  name = 'AddedRoles1723486825734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."project_user_roles_role_enum" AS ENUM('owner', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_user_roles" ("id" SERIAL NOT NULL, "role" "public"."project_user_roles_role_enum" NOT NULL, "userId" integer, "projectId" integer, CONSTRAINT "PK_5ad3281699c4d92a5b07e7d14a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "application_roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_2e402766a0224c561ca2359893c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "applicationRoleId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_roles" ADD CONSTRAINT "FK_5e8a9aa5bd47e4538970b2a571d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_roles" ADD CONSTRAINT "FK_f4cf54ba0135819959eda8c9ae1" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_b9856829677ff75ecc852bce803" FOREIGN KEY ("applicationRoleId") REFERENCES "application_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_b9856829677ff75ecc852bce803"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_roles" DROP CONSTRAINT "FK_f4cf54ba0135819959eda8c9ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_roles" DROP CONSTRAINT "FK_5e8a9aa5bd47e4538970b2a571d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "applicationRoleId"`,
    );
    await queryRunner.query(`DROP TABLE "application_roles"`);
    await queryRunner.query(`DROP TABLE "project_user_roles"`);
    await queryRunner.query(
      `DROP TYPE "public"."project_user_roles_role_enum"`,
    );
  }
}
