import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setupMocks,
  resetMocks,
  mockQueries,
  mockMediaService,
  mockRankingQueries,
  mockGameQueries,
} from "../utils/enhanced-mocks";

import * as GameService from "../../src/main/game/game.service";

describe("Service - Game Service", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("launch game", () => {});
});
