import { useGames } from "@render/api/get-games";
import Button from "@render/components/new/button/Button";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { Dialog } from "@render/components/new/popup";
import { ReactSelectSingle } from "@render/components/new/select";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateGameRanking } from "../api/create-game-ranking";

export const AddGameRanking = () => {
  const { id } = useParams({ from: "/ranking/$id" });
  const [selectedGame, setSelectedGame] = useState<string>("");

  const createGameRanking = useCreateGameRanking({
    data: {
      gameId: selectedGame,
      rankingId: Number(id),
    },
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const gamesQuery = useGames({});

  if (gamesQuery.isPending) return <LoadingCenter />;

  const games = gamesQuery?.data?.map((game) => ({ value: game.id, label: game.name })) ?? [];

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button intent={"primary"} text="Add game" size="md" />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Add game to ranking</Dialog.Title>

        <ReactSelectSingle options={games} onChange={(e: any) => setSelectedGame(e.value)} />

        <Dialog.Footer>
          <Dialog.NegativeAction text="Cancel" size={"md"} />
          <Dialog.PositiveAction
            intent="primary"
            size="md"
            text="Add"
            onClick={() =>
              createGameRanking.mutate({
                gameId: selectedGame,
                rankingId: Number(id),
              })
            }
          />
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
