-- This is an empty migration.

INSERT INTO "GameStatus" (name) values ("completed");
INSERT INTO "GameStatus" (name) values ("beaten");
INSERT INTO "GameStatus" (name) values ("dropped");
INSERT INTO "GameStatus" (name) values ("playing");
INSERT INTO "GameStatus" (name) values ("planned");


update "GameStatus" set name = "unplayed" where id=1;
update "GameStatus" set name = "played" where id=2;
