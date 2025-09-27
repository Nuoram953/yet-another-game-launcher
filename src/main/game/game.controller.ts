import { GameLaunchApp, GameLaunchEmulation } from "@prisma/client";
import * as GameService from "./game.service";
import { LaunchType } from "@common/types";
import queries from "../dal/dal";
import _ from "lodash";

export const createOrUpdateLaunchApp = async (data: Partial<GameLaunchApp>): Promise<GameLaunchApp> => {
  const launch = await GameService.createOrUpdateLaunchApp(data);

  await GameService.refreshGame(data.gameId);

  return launch;
};

export const createOrUpdateLaunchEmulator = async (
  data: Partial<GameLaunchEmulation>,
): Promise<GameLaunchEmulation> => {
  const launch = await GameService.createOrUpdateLaunchEmulator(data);

  await GameService.refreshGame(data.gameId);

  return launch;
};

export const deleteLaunch = async (type: LaunchType, id: number): Promise<void> => {
  let launch: any;

  switch (type) {
    case LaunchType.APP:
      {
        launch = await queries.GameLaunchApp.getById(id);
      }
      break;
    case LaunchType.EMULATOR:
      {
        launch = await queries.GameLaunchEmulator.getById(id);
      }
      break;
  }

  if (_.isNil(launch)) {
    throw new Error("Launch not found");
  }

  await GameService.deleteLaunch(type, id);

  await GameService.refreshGame(launch.gameId);
};
