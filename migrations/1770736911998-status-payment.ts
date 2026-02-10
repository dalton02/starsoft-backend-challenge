import { MigrationInterface, QueryRunner } from "typeorm";

export class StatusPayment1770736911998 implements MigrationInterface {
    name = 'StatusPayment1770736911998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('PENDING', 'APPROVED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD "status" "public"."reservation_status_enum" NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_status_enum"`);
    }

}
