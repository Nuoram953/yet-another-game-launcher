import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736135719367 implements MigrationInterface {
    name = 'Migration1736135719367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_game" ("id" varchar PRIMARY KEY NOT NULL, "storefrontId" integer, "external_id" integer NOT NULL, "gameStatusId" integer, "name" varchar NOT NULL, "time_played" bigint NOT NULL, CONSTRAINT "FK_70354d2e2892115587d94400081" FOREIGN KEY ("gameStatusId") REFERENCES "game_status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_68ecb95150aa32ab1bf8507aed8" FOREIGN KEY ("storefrontId") REFERENCES "storefront" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_game"("id", "storefrontId", "external_id", "gameStatusId") SELECT "id", "storefrontId", "external_id", "gameStatusId" FROM "game"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`ALTER TABLE "temporary_game" RENAME TO "game"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" RENAME TO "temporary_game"`);
        await queryRunner.query(`CREATE TABLE "game" ("id" varchar PRIMARY KEY NOT NULL, "storefrontId" integer, "external_id" integer NOT NULL, "gameStatusId" integer, CONSTRAINT "FK_70354d2e2892115587d94400081" FOREIGN KEY ("gameStatusId") REFERENCES "game_status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_68ecb95150aa32ab1bf8507aed8" FOREIGN KEY ("storefrontId") REFERENCES "storefront" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "game"("id", "storefrontId", "external_id", "gameStatusId") SELECT "id", "storefrontId", "external_id", "gameStatusId" FROM "temporary_game"`);
        await queryRunner.query(`DROP TABLE "temporary_game"`);
    }

}
