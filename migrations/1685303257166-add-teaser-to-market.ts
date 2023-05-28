import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeaserToMarket1685303257166 implements MigrationInterface {
  name = 'AddTeaserToMarket1685303257166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ADD "teaser" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "teaser"`);
  }
}
