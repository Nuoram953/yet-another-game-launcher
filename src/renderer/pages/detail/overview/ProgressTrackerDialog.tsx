import { Button } from "@/components/button/Button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGames } from "@/context/DatabaseContext";
import React from "react";

export const ProgressTrackerDialog = () => {
  const { selectedGame } = useGames();

  if (!selectedGame) {
    return;
  }

  const handleRefresh = () => {
    window.game.refreshProgressTracker(selectedGame.id!);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button intent={"primary"} text="Refresh" onClick={handleRefresh} />
      </DialogFooter>
    </>
  );
};
