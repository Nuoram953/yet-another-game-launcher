import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736171321527 implements MigrationInterface {
    name = 'Migration1736171321527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "storefront" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "game_status" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "game" ("id" varchar PRIMARY KEY NOT NULL, "external_id" integer NOT NULL, "name" varchar NOT NULL, "time_played" bigint NOT NULL, "storefrontId" integer, "gameStatusId" integer, CONSTRAINT "UQ_f977c2ad09ec9eb76fd6f7aac54" UNIQUE ("storefrontId", "external_id"))`);
        await queryRunner.query(`CREATE TABLE "temporary_game" ("id" varchar PRIMARY KEY NOT NULL, "external_id" integer NOT NULL, "name" varchar NOT NULL, "time_played" bigint NOT NULL, "storefrontId" integer, "gameStatusId" integer, CONSTRAINT "UQ_f977c2ad09ec9eb76fd6f7aac54" UNIQUE ("storefrontId", "external_id"), CONSTRAINT "FK_68ecb95150aa32ab1bf8507aed8" FOREIGN KEY ("storefrontId") REFERENCES "storefront" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_70354d2e2892115587d94400081" FOREIGN KEY ("gameStatusId") REFERENCES "game_status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_game"("id", "external_id", "name", "time_played", "storefrontId", "gameStatusId") SELECT "id", "external_id", "name", "time_played", "storefrontId", "gameStatusId" FROM "game"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`ALTER TABLE "temporary_game" RENAME TO "game"`);
        await queryRunner.query(`INSERT into storefront (name) values ('steam')`);
        await queryRunner.query(`INSERT into game_status (name) values ('UNPLAYED')`);
        await queryRunner.query(`INSERT into game_status (name) values ('PLAYED')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" RENAME TO "temporary_game"`);
        await queryRunner.query(`CREATE TABLE "game" ("id" varchar PRIMARY KEY NOT NULL, "external_id" integer NOT NULL, "name" varchar NOT NULL, "time_played" bigint NOT NULL, "storefrontId" integer, "gameStatusId" integer, CONSTRAINT "UQ_f977c2ad09ec9eb76fd6f7aac54" UNIQUE ("storefrontId", "external_id"))`);
        await queryRunner.query(`INSERT INTO "game"("id", "external_id", "name", "time_played", "storefrontId", "gameStatusId") SELECT "id", "external_id", "name", "time_played", "storefrontId", "gameStatusId" FROM "temporary_game"`);
        await queryRunner.query(`DROP TABLE "temporary_game"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "game_status"`);
        await queryRunner.query(`DROP TABLE "storefront"`);
    }

}
