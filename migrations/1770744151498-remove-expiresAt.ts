import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveExpiresAt1770744151498 implements MigrationInterface {
    name = 'RemoveExpiresAt1770744151498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "expiresAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "expiresAt" TIMESTAMP NOT NULL`);
    }

}
