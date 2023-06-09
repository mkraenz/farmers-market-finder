import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1686597325488 implements MigrationInterface {
  name = 'Init1686597325488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "market" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "teaser" character varying NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "country" character varying NOT NULL, "location" jsonb NOT NULL, "zip" character varying NOT NULL, "products" text array NOT NULL DEFAULT '{}', "images" jsonb NOT NULL DEFAULT '[]', "distance" double precision, CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "market"`);
  }
}
