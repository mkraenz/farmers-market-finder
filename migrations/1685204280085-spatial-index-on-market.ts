import { MigrationInterface, QueryRunner } from 'typeorm';

export class SpatialIndexOnMarket1685204280085 implements MigrationInterface {
  name = 'SpatialIndexOnMarket1685204280085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "market" ADD "distance" double precision`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_996aab23464e0522f4d556230c" ON "market" USING GiST ("location") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_996aab23464e0522f4d556230c"`,
    );
    await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "distance"`);
  }
}
