import { ArrowDownToLine, CircleX, Play } from "lucide-react";
import React, { useState } from "react";
import { useGames } from "@render//context/DatabaseContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@render//components/ui/alert-dialog";
import useGameStore from "@render/feature/detail/store/GameStore";
import { LaunchType } from "@common/types";
import { Dialog } from "../new/popup";
import Button from "../new/button/Button";
import _ from "lodash";

export const ButtonPlay = () => {
  const game = useGameStore((state) => state.game);
  const { running } = useGames();
  const [open, setOpen] = useState<boolean>(false);

  const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
  const [selectedLaunchType, setSelectedLaunchType] = useState<LaunchType | null>(null);

  console.log(game);

  const handleOnPlay = async (type: LaunchType, id: number) => {
    setSelectedLaunchId(id);
    setSelectedLaunchType(type);
    await window.game.launch(game.id, type, id);
  };

  const handleOnInstall = async () => {
    await window.game.install(game.id);
  };

  const handleOnAlertDialogPositif = async () => {
    window.game.kill(game.id, selectedLaunchId, selectedLaunchType);
    setOpen(false);
  };

  const handleOnAlertDialogNegatif = async () => {
    setOpen(false);
  };

  const handleOnStop = async () => {
    setOpen(true);
  };

  if (running.map((item) => item.id).includes(game.id)) {
    return (
      <>
        <Button size="large" intent="primary" state="running" onClick={handleOnStop} leadingIcon={<CircleX />}>
          Stop
        </Button>
        <AlertDialog open={open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our
                servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleOnAlertDialogNegatif}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleOnAlertDialogPositif}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (!game?.isInstalled && game.launchStorefront.length > 0) {
    return (
      <Button size="large" intent="primary" state="install" onClick={handleOnInstall} leadingIcon={<ArrowDownToLine />}>
        Install
      </Button>
    );
  }

  const launchEnabled = [
    ...game.launchApp.filter((app) => app.isEnabled),
    ...game.launchStorefront.filter((app) => app.isEnabled),
    ...game.launchEmulation.filter((app) => app.isEnabled && !_.isNil(app.path) && !_.isEmpty(app.path)),
  ];

  if (launchEnabled.length === 0) {
    return (
      <Button size="large" intent="primary" state="play" disabled leadingIcon={<Play />}>
        No launch method
      </Button>
    );
  }

  if (launchEnabled.length === 1) {
    if (game.launchApp.some((app) => app.isEnabled)) {
      const app = game.launchApp.find((app) => app.isEnabled);
      return (
        <Button
          size="large"
          intent="primary"
          state="play"
          onClick={() => handleOnPlay(LaunchType.APP, app.id)}
          leadingIcon={<Play />}
        >
          Play
        </Button>
      );
    }
    if (game.launchStorefront.some((app) => app.isEnabled)) {
      const app = game.launchStorefront.find((app) => app.isEnabled);
      return (
        <Button
          size="large"
          intent="primary"
          state="play"
          onClick={() => handleOnPlay(LaunchType.STOREFRONT, app.id)}
          leadingIcon={<Play />}
        >
          Play
        </Button>
      );
    }
    if (game.launchEmulation.some((app) => app.isEnabled)) {
      const app = game.launchEmulation.find((app) => app.isEnabled);
      return (
        <Button
          size="large"
          intent="primary"
          state="play"
          onClick={() => handleOnPlay(LaunchType.EMULATOR, app.id)}
          leadingIcon={<Play />}
        >
          Play
        </Button>
      );
    }
  } else {
    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button size="large" intent="primary" state="play">
            Play
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Launch game</Dialog.Title>
          <div className="flex flex-col gap-4">
            {game.launchStorefront.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    intent="primary"
                    size="large"
                    className="text-white"
                    background={false}
                    onClick={() => {
                      handleOnPlay(LaunchType.STOREFRONT, launch.id);
                    }}
                  >
                    {launch.name}
                  </Button>
                ),
            )}

            {game.launchApp.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    intent="primary"
                    className="text-white"
                    size="large"
                    background={false}
                    onClick={() => {
                      handleOnPlay(LaunchType.APP, launch.id);
                    }}
                  >
                    {launch.name}
                  </Button>
                ),
            )}

            {game.launchEmulation.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    intent="primary"
                    className="text-white"
                    size="large"
                    background={false}
                    onClick={() => {
                      handleOnPlay(LaunchType.EMULATOR, launch.id);
                    }}
                  >
                    {launch.name}
                  </Button>
                ),
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    );
  }
};
