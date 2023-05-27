import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPointToMarket1685186135292 implements MigrationInterface {
  name = 'AddPointToMarket1685186135292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market" ADD "point" geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "point"`);
  }
}
