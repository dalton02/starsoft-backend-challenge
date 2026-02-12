import { MigrationInterface, QueryRunner } from "typeorm";

export class Db1770851893008 implements MigrationInterface {
    name = 'Db1770851893008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying NOT NULL, "movie" character varying NOT NULL, "room" character varying NOT NULL, "price" integer NOT NULL, "showtime" TIMESTAMP NOT NULL, "duration" integer NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."seat_status_enum" AS ENUM('AVAILABLE', 'HOLDING', 'RESERVED')`);
        await queryRunner.query(`CREATE TABLE "seat" ("id" character varying NOT NULL, "placement" character varying NOT NULL, "status" "public"."seat_status_enum" NOT NULL DEFAULT 'AVAILABLE', "session_id" character varying, "current_reservation_id" character varying, CONSTRAINT "PK_4e72ae40c3fbd7711ccb380ac17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('PENDING', 'APPROVED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "reservation" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "payedAt" TIMESTAMP, "expiresAt" TIMESTAMP NOT NULL, "status" "public"."reservation_status_enum" NOT NULL DEFAULT 'PENDING', "userId" character varying, "seatId" character varying, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('MANAGER', 'CUSTOMER')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "name" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_8377b8e8e45110c64e1c50a5463" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_629d11d30c1eadbd7c4b162eade" FOREIGN KEY ("current_reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_529dceb01ef681127fef04d755d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_70ef2f828ce6c1caa4646cf4801" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_70ef2f828ce6c1caa4646cf4801"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_529dceb01ef681127fef04d755d"`);
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_629d11d30c1eadbd7c4b162eade"`);
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_8377b8e8e45110c64e1c50a5463"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_status_enum"`);
        await queryRunner.query(`DROP TABLE "seat"`);
        await queryRunner.query(`DROP TYPE "public"."seat_status_enum"`);
        await queryRunner.query(`DROP TABLE "session"`);
    }

}
