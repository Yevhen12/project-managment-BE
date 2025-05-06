import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1723283547266 implements MigrationInterface {
  name = 'CreateInitialSchema1723283547266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sprint" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "boardId" integer, CONSTRAINT "PK_f371c7b5c4bc62fb2ba2bdb9f61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "projectId" integer, CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "status" character varying NOT NULL, "ownerId" integer, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "authorId" integer, "taskId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_a0669bd34078f33604ec209dab1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "label" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_5692ac5348861d3776eb5843672" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachment" ("id" SERIAL NOT NULL, "fileName" character varying NOT NULL, "fileType" character varying NOT NULL, "fileSize" integer NOT NULL, "taskId" integer, CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_status" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b8747cc6a41b6cef4639babf61d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_log" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, "userId" integer, "taskId" integer, CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "projectId" integer, "assigneeId" integer, "boardId" integer, "sprintId" integer, "typeId" integer, "statusId" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" SERIAL NOT NULL, "country" character varying NOT NULL, "region" character varying NOT NULL, "registrationDate" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "REL_51cb79b5555effaf7d69ba1cff" UNIQUE ("userId"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "userId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_members_user" ("teamId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_946e161af78b3cc26186236d3bd" PRIMARY KEY ("teamId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3f2c420a7871621010a4e1d21" ON "team_members_user" ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45db1cff3b87cc40512fb2963e" ON "team_members_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "team_projects_project" ("teamId" integer NOT NULL, "projectId" integer NOT NULL, CONSTRAINT "PK_02cefcae57745b0c241b712ea7d" PRIMARY KEY ("teamId", "projectId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_91997efd025c2003a88699c74a" ON "team_projects_project" ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cccb2c8892944892a835ec0246" ON "team_projects_project" ("projectId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprint" ADD CONSTRAINT "FK_3ebb1d3425a446881d6d3048312" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_954fce22cf9a797afc6b1560c76" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_611282e10752b2ecbd5c8525ab5" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_d19abacc8a508c0429478ad166b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_7ffe389f12520c87d7d247a62bb" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_7384988f7eeb777e44802a0baca" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_d88edac9d7990145ff6831a7bb3" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_5ad8a047b8f023bf36b2a232a42" FOREIGN KEY ("sprintId") REFERENCES "sprint"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_37835cf91476a114202962303c1" FOREIGN KEY ("typeId") REFERENCES "task_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_02068239bb8d5b2fc7f3ded618c" FOREIGN KEY ("statusId") REFERENCES "task_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_user" ADD CONSTRAINT "FK_b3f2c420a7871621010a4e1d212" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_user" ADD CONSTRAINT "FK_45db1cff3b87cc40512fb2963ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_projects_project" ADD CONSTRAINT "FK_91997efd025c2003a88699c74ae" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_projects_project" ADD CONSTRAINT "FK_cccb2c8892944892a835ec02466" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_projects_project" DROP CONSTRAINT "FK_cccb2c8892944892a835ec02466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_projects_project" DROP CONSTRAINT "FK_91997efd025c2003a88699c74ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_user" DROP CONSTRAINT "FK_45db1cff3b87cc40512fb2963ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_user" DROP CONSTRAINT "FK_b3f2c420a7871621010a4e1d212"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_02068239bb8d5b2fc7f3ded618c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_37835cf91476a114202962303c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_5ad8a047b8f023bf36b2a232a42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_d88edac9d7990145ff6831a7bb3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_7384988f7eeb777e44802a0baca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_7ffe389f12520c87d7d247a62bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_d19abacc8a508c0429478ad166b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" DROP CONSTRAINT "FK_611282e10752b2ecbd5c8525ab5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" DROP CONSTRAINT "FK_954fce22cf9a797afc6b1560c76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprint" DROP CONSTRAINT "FK_3ebb1d3425a446881d6d3048312"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cccb2c8892944892a835ec0246"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_91997efd025c2003a88699c74a"`,
    );
    await queryRunner.query(`DROP TABLE "team_projects_project"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45db1cff3b87cc40512fb2963e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3f2c420a7871621010a4e1d21"`,
    );
    await queryRunner.query(`DROP TABLE "team_members_user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "user_profile"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TABLE "activity_log"`);
    await queryRunner.query(`DROP TABLE "task_status"`);
    await queryRunner.query(`DROP TABLE "attachment"`);
    await queryRunner.query(`DROP TABLE "label"`);
    await queryRunner.query(`DROP TABLE "task_type"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TABLE "board"`);
    await queryRunner.query(`DROP TABLE "sprint"`);
  }
}
