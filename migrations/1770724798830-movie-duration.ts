import { MigrationInterface, QueryRunner } from "typeorm";

export class MovieDuration1770724798830 implements MigrationInterface {
    name = 'MovieDuration1770724798830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "duration" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "duration"`);
    }

}
