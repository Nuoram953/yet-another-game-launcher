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
import { Button } from "./Button";

export const ButtonPlay = () => {
  const { running, selectedGame } = useGames();
  const [open, setOpen] = useState<boolean>(false);

  if (!selectedGame) {
    return;
  }

  const handleOnPlay = async () => {
    await window.game.launch(selectedGame.id);
  };

  const handleOnInstall = async () => {
    await window.game.install(selectedGame.id);
  };

  const handleOnAlertDialogPositif = async () => {
    window.game.kill(selectedGame.id);
    setOpen(false);
  };

  const handleOnAlertDialogNegatif = async () => {
    setOpen(false);
  };

  const handleOnStop = async () => {
    setOpen(true);
  };

  if (running.map((item) => item.id).includes(selectedGame.id)) {
    return (
      <>
        <Button size="large" intent="primary" state="running" onClick={handleOnStop} text="Stop" icon={CircleX} />
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

  if (!selectedGame?.isInstalled) {
    return (
      <Button
        size="large"
        intent="primary"
        state="install"
        onClick={handleOnInstall}
        text="Install"
        icon={ArrowDownToLine}
      />
    );
  }

  return <Button size="large" intent="primary" state="play" onClick={handleOnPlay} text="Play Now" icon={Play} />;
};
