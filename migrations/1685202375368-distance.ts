import { MigrationInterface, QueryRunner } from 'typeorm';

export class Distance1685202375368 implements MigrationInterface {
  name = 'Distance1685202375368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ALTER COLUMN "location" TYPE geometry(Point)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ALTER COLUMN "location" TYPE geometry(POINT,0)`,
    );
  }
}
