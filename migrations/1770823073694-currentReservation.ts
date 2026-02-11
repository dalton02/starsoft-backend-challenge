import { MigrationInterface, QueryRunner } from "typeorm";

export class CurrentReservation1770823073694 implements MigrationInterface {
    name = 'CurrentReservation1770823073694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seat" ADD "current_reservation_id" character varying`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_629d11d30c1eadbd7c4b162eade" FOREIGN KEY ("current_reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_629d11d30c1eadbd7c4b162eade"`);
        await queryRunner.query(`ALTER TABLE "seat" DROP COLUMN "current_reservation_id"`);
    }

}
