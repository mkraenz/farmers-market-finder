import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesToMarket1685254941506 implements MigrationInterface {
  name = 'AddImagesToMarket1685254941506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ADD "images" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "images"`);
  }
}
