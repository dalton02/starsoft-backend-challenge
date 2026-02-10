import { MigrationInterface, QueryRunner } from "typeorm";

export class MoreReservationFields1770758440803 implements MigrationInterface {
    name = 'MoreReservationFields1770758440803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "payedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD "expiresAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "payedAt"`);
    }

}
