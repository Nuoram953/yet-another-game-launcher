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
import { useParams } from "@tanstack/react-router";
import { useGame } from "@render/api/get-game";
import { LoadingCenter } from "../new/loading/Loading";
import { useLaunchGame } from "@render/feature/home/api/post-launch-game";

export const ButtonPlay = () => {
  const { id } = useParams({ from: "/game/$id" });

  const gameQuery = useGame({ gameId: id });
  const launchGame = useLaunchGame({});
  const { running } = useGames();
  const [open, setOpen] = useState<boolean>(false);

  const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
  const [selectedLaunchType, setSelectedLaunchType] = useState<LaunchType | null>(null);

  if (gameQuery.isPending) {
    return <LoadingCenter />;
  }

  const game = gameQuery.data;

  const handleOnPlay = async (type: LaunchType, id: number) => {
    setSelectedLaunchId(id);
    setSelectedLaunchType(type);
    launchGame.mutate({
      gameId: game!.id,
      launchId: id,
      launchType: type,
    });
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
        <Button text={"Stop"} size="md" intent="primary" onClick={handleOnStop} leadingIcon={<CircleX />} />
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
      <Button text={"Install"} size="md" intent="primary" onClick={handleOnInstall} leadingIcon={<ArrowDownToLine />} />
    );
  }

  const launchEnabled = [
    ...game.launchApp.filter((app) => app.isEnabled),
    ...game.launchStorefront.filter((app) => app.isEnabled),
    ...game.launchEmulation.filter((app) => app.isEnabled && !_.isNil(app.path) && !_.isEmpty(app.path)),
  ];

  if (launchEnabled.length === 0) {
    return <Button text={"No launch methods"} size="md" intent="primary" disabled leadingIcon={<Play />} />;
  }

  if (launchEnabled.length === 1) {
    if (game.launchApp.some((app) => app.isEnabled)) {
      const app = game.launchApp.find((app) => app.isEnabled);
      return (
        <Button
          text="Play"
          size="md"
          intent="primary"
          onClick={() => handleOnPlay(LaunchType.APP, app.id)}
          leadingIcon={<Play />}
        />
      );
    }
    if (game.launchStorefront.some((app) => app.isEnabled)) {
      const app = game.launchStorefront.find((app) => app.isEnabled);
      return (
        <Button
          text="Play"
          size="md"
          intent="primary"
          onClick={() => handleOnPlay(LaunchType.STOREFRONT, app.id)}
          leadingIcon={<Play />}
        />
      );
    }
    if (game.launchEmulation.some((app) => app.isEnabled)) {
      const app = game.launchEmulation.find((app) => app.isEnabled);
      return (
        <Button
          text="Play"
          size="md"
          intent="primary"
          onClick={() => handleOnPlay(LaunchType.EMULATOR, app.id)}
          leadingIcon={<Play />}
        />
      );
    }
  } else {
    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button text="play" size="md" intent="primary" />
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Launch game</Dialog.Title>
          <div className="flex flex-col gap-4">
            {game.launchStorefront.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    text={launch.name}
                    intent="primary"
                    size="md"
                    onClick={() => {
                      handleOnPlay(LaunchType.STOREFRONT, launch.id);
                    }}
                  />
                ),
            )}

            {game.launchApp.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    intent="primary"
                    size="md"
                    text={launch.name}
                    onClick={() => {
                      handleOnPlay(LaunchType.APP, launch.id);
                    }}
                  />
                ),
            )}

            {game.launchEmulation.map(
              (launch) =>
                launch.isEnabled && (
                  <Button
                    intent="primary"
                    text={launch.name}
                    onClick={() => {
                      handleOnPlay(LaunchType.EMULATOR, launch.id);
                    }}
                  />
                ),
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    );
  }
};
