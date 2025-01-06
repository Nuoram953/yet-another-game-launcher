import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736134895152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT into storefront (name) values ('steam')`);
        await queryRunner.query(`INSERT into game_status (name) values ('UNPLAYED')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
