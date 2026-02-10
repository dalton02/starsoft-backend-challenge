import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1770727376655 implements MigrationInterface {
    name = 'Migrations1770727376655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "showtime"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "showtime" date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "showtime"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "showtime" TIMESTAMP NOT NULL`);
    }

}
