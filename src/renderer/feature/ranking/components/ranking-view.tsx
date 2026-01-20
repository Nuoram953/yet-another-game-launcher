import { useNavigate, useParams } from "@tanstack/react-router";
import { useRanking } from "../api/get-ranking";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { GripVertical, X } from "lucide-react";
import { DeleteRanking } from "./delete-ranking";
import { AddGameRanking } from "./add-game-ranking";
import { GameInfo } from "./GameInfo";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { useGame } from "@render/api/get-game";
import { useGameCover } from "@render/api/get-game-cover";
import ButtonIcon from "@render/components/new/button/ButtonIcon";
import { useDeleteGameRanking } from "../api/remove-game-ranking";
import Button from "@render/components/new/button/Button";
import { useUpdateRankingGameOrder } from "../api/update-game-ranking-order";
import Section from "@render/components/new/section";

interface SortableGameItemProps {
  item: {
    id: string;
    name: string;
    cover?: string;
  };
  index: number;
}

const SortableGameItem = ({ item, index }: SortableGameItemProps) => {
  const { id } = useParams({ from: "/ranking/$id" });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const navigate = useNavigate();

  const removeGameFromRanking = useDeleteGameRanking({
    data: {
      rankingId: Number(id),
      gameId: item.id,
    },
  });

  const gameQuery = useGame({ gameId: item.id });
  const coverQuery = useGameCover({ gameId: item.id });

  if (gameQuery.isPending || coverQuery.isPending) return <LoadingCenter />;

  const game = gameQuery?.data!;
  const cover = coverQuery?.data?.[0] ?? "";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? "cursor-grabbing opacity-50" : "cursor-grab"}`}>
      <div className="flex items-start justify-between rounded-md border border-normal bg-foreground p-6 shadow-md hover:border-hover">
        <div className="flex flex-1 items-center justify-center gap-4">
          <div {...attributes} {...listeners}>
            <ButtonIcon
              className="mt-2 cursor-grab"
              icon={<GripVertical />}
              intent={"tertiary"}
              text="Drag to reorder"
            />
          </div>
          <div className="flex flex-1 items-center gap-3">
            <span className="mt-2 min-w-[2rem] text-sm font-medium text-gray-400">#{index + 1}</span>
            <div className="flex flex-1 gap-6">
              <img
                key={game.id}
                src={cover}
                alt={game.name}
                className="w-40 flex-shrink-0 rounded-xl object-cover shadow-lg"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <Button
                  className="h-fit w-fit !items-start !justify-start text-xl font-bold"
                  intent={"link"}
                  text={game.name}
                  onClick={() => {
                    navigate({ to: "/game/$id", params: { id: game.id } });
                  }}
                />
                <GameInfo game={game} />
              </div>
            </div>
          </div>
        </div>
        <ButtonIcon
          className="mt-2"
          icon={<X className="hover:text-red-500" />}
          intent={"tertiary"}
          text={`Remove ${game.name} from ranking`}
          onClick={() => {
            removeGameFromRanking.mutate({
              rankingId: Number(id),
              gameId: item.id,
            });
          }}
        />
      </div>
    </div>
  );
};

export const RankingView = () => {
  const { id } = useParams({ from: "/ranking/$id" });
  const rankingQuery = useRanking({ id: Number(id) });
  const [games, setGames] = useState<Array<{ id: string; name: string; cover?: string }>>([]);

  const updateGameOrder = useUpdateRankingGameOrder({
    data: {
      rankingId: Number(id),
      gameOrders: [],
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (rankingQuery.data?.games) {
      setGames(rankingQuery.data.games);
    }
  }, [rankingQuery.data?.games]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = games.findIndex((game) => game.id === active.id);
    const newIndex = games.findIndex((game) => game.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newGames = arrayMove(games, oldIndex, newIndex);
      setGames(newGames);

      const gameOrders = newGames.map((game, index) => ({
        gameId: game.id,
        rank: index + 1,
      }));

      updateGameOrder.mutate({
        rankingId: Number(id),
        gameOrders,
      });
    }
  };

  if (rankingQuery.isPending) return <LoadingCenter />;

  const ranking = rankingQuery.data;
  const displayGames = games.length > 0 ? games : ranking?.games || [];

  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <Section>
        <div className="flex-shrink-0">
          <Section.Title title={ranking?.name || "Ranking"} />
          <div className="flex w-full justify-end px-4 pb-4">
            <AddGameRanking />
          </div>
        </div>
      </Section>
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="space-y-4 p-4 pb-8">
            {displayGames.length > 0 ? (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={displayGames.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                    {displayGames.map((game, index) => (
                      <SortableGameItem key={game.id} item={game} index={index} />
                    ))}
                  </SortableContext>
                </DndContext>

                <DeleteRanking />
              </>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <div className="text-center">
                  <p className="mb-2 text-lg">No games in this ranking yet</p>
                  <p className="text-sm">Add your first game to get started!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
