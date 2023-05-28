import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToMarket1685301711239 implements MigrationInterface {
  name = 'AddNameToMarket1685301711239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ADD "name" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "name"`);
  }
}
