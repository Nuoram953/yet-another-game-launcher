import { CircleX, Play } from "lucide-react";
import { Button } from "../ui/button";
import React, { useState } from "react";
import { useGames } from "@/context/DatabaseContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ButtonPlay = () => {
  const { running, selectedGame } = useGames();
  const [open, setOpen] = useState<boolean>(false);

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
        <Button
          size="lg"
          className="transform bg-blue-600 text-white transition-all duration-300 hover:scale-105 hover:bg-blue-500 hover:shadow-lg"
          onClick={handleOnStop}
        >
          <CircleX className="mr-2 h-5 w-5 animate-pulse" />
          Stop
        </Button>
        <AlertDialog open={open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleOnAlertDialogNegatif}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleOnAlertDialogPositif}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (!selectedGame?.isInstalled) {
    return (
      <Button
        size="lg"
        className="transform bg-yellow-600 text-white transition-all duration-300 hover:scale-105 hover:bg-yellow-500 hover:shadow-lg"
        onClick={handleOnInstall}
      >
        <Play className="mr-2 h-5 w-5 animate-pulse" />
        Install
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="transform bg-green-600 text-white transition-all duration-300 hover:scale-105 hover:bg-green-500 hover:shadow-lg"
      onClick={handleOnPlay}
    >
      <Play className="mr-2 h-5 w-5 animate-pulse" />
      Play Now
    </Button>
  );
};
