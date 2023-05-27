import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1685201184310 implements MigrationInterface {
  name = 'Init1685201184310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "market" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "country" character varying NOT NULL, "location" geometry(Point) NOT NULL, "zip" character varying NOT NULL, "products" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "market"`);
  }
}
