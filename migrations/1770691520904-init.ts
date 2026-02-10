import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1770691520904 implements MigrationInterface {
  name = 'Init1770691520904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "session" ("id" character varying NOT NULL, "movie" character varying NOT NULL, "room" character varying NOT NULL, "price" integer NOT NULL, "showtime" TIMESTAMP NOT NULL, "seatsId" character varying, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "seat" ("id" character varying NOT NULL, "placement" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'AVAILABLE', CONSTRAINT "PK_4e72ae40c3fbd7711ccb380ac17" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservation" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, "userId" character varying, "seatId" character varying, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" character varying NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_9d82fa50065335dfdee16372144" FOREIGN KEY ("seatsId") REFERENCES "seat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation" ADD CONSTRAINT "FK_529dceb01ef681127fef04d755d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation" ADD CONSTRAINT "FK_70ef2f828ce6c1caa4646cf4801" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservation" DROP CONSTRAINT "FK_70ef2f828ce6c1caa4646cf4801"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation" DROP CONSTRAINT "FK_529dceb01ef681127fef04d755d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_9d82fa50065335dfdee16372144"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "reservation"`);
    await queryRunner.query(`DROP TABLE "seat"`);
    await queryRunner.query(`DROP TABLE "session"`);
  }
}
