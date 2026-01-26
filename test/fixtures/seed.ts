import { getTestPrismaClient } from "../utils/database";
import type { Game, GameStatus, Storefront, RankingStatus, RankingTag, Ranking, RankingGame } from "@prisma/client";

interface TestGame extends Omit<Game, "id" | "createdAt" | "updatedAt"> {
  id?: string;
}

interface TestRanking extends Omit<Ranking, "id" | "createdAt" | "updatedAt"> {
  id?: number;
}

interface TestRankingGame extends Omit<RankingGame, "id" | "createdAt" | "updatedAt"> {
  id?: number;
}

export class TestDataFactory {
  private static gameCounter = 1;
  private static rankingCounter = 1;

  static createGame(overrides: Partial<TestGame> = {}): TestGame {
    const id = `test-game-${Date.now()}-${this.gameCounter++}`;
    return {
      id,
      externalId: null,
      name: `Test Game ${this.gameCounter - 1}`,
      lastTimePlayed: null,
      isInstalled: true,
      isFavorite: false,
      isEmulation: false,
      isStorefront: false,
      isManual: false,
      gameStatusId: 1,
      storefrontId: null,
      timePlayed: 0,
      timePlayedWindows: 0,
      timePlayedLinux: 0,
      timePlayedMac: 0,
      timePlayedSteamdeck: 0,
      timePlayedDisconnected: 0,
      size: BigInt(1000000),
      location: "/path/to/game",
      hasAchievements: false,
      scoreCritic: null,
      scoreCommunity: null,
      scoreUser: null,
      summary: `Summary for test game ${this.gameCounter - 1}`,
      releasedAt: new Date("2023-01-01"),
      openedAt: null,
      mainStory: null,
      mainPlusExtra: null,
      completionist: null,
      ...overrides,
    };
  }

  static createRanking(overrides: Partial<TestRanking> = {}): TestRanking {
    return {
      id: this.rankingCounter++,
      name: `Test Ranking ${this.rankingCounter - 1}`,
      description: `Description for test ranking ${this.rankingCounter - 1}`,
      isPinned: false,
      maxItems: 10,
      rankingStatusId: 1,
      ...overrides,
    };
  }

  static createRankingGame(
    rankingId: number,
    gameId: string,
    rank: number = 1,
    overrides: Partial<TestRankingGame> = {},
  ): TestRankingGame {
    return {
      rankingId,
      gameId,
      rank,
      ...overrides,
    };
  }

  static reset() {
    this.gameCounter = 1;
    this.rankingCounter = 1;
  }
}

export async function seedTestData(): Promise<void> {
  const prisma = getTestPrismaClient();

  await prisma.gameStatus.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Installed",
    },
  });

  await prisma.rankingStatus.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Active",
    },
  });

  await prisma.rankingTag.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Favorites",
    },
  });

  await prisma.rankingTag.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Best of Year",
    },
  });
}

export async function createTestGames(count: number): Promise<Game[]> {
  const prisma = getTestPrismaClient();
  const games: Game[] = [];

  for (let i = 0; i < count; i++) {
    const gameData = TestDataFactory.createGame({
      name: `Test Game ${i + 1}`,
    });

    const game = await prisma.game.create({
      data: gameData,
    });

    games.push(game);
  }

  return games;
}

export async function createTestRankingWithGames(
  rankingData: Partial<TestRanking> = {},
  gameCount: number = 3,
): Promise<{ ranking: Ranking; games: Game[] }> {
  const prisma = getTestPrismaClient();

  const games = await createTestGames(gameCount);

  const ranking = await prisma.ranking.create({
    data: TestDataFactory.createRanking(rankingData),
  });

  for (let i = 0; i < games.length; i++) {
    await prisma.rankingGame.create({
      data: TestDataFactory.createRankingGame(ranking.id, games[i].id, i + 1),
    });
  }

  return { ranking, games };
}
