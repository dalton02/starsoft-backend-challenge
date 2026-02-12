import { MigrationInterface, QueryRunner } from "typeorm";

export class TimezoneReservationExpiration1770912336608 implements MigrationInterface {
    name = 'TimezoneReservationExpiration1770912336608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD "expiresAt" TIMESTAMP NOT NULL`);
    }

}
