import React, { useEffect, useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Gamepad2, ListOrdered, BookmarkPlus, Plus, ArrowRight } from "lucide-react";
import { useGames } from "@render//context/DatabaseContext";
import { useParams } from "react-router-dom";
import { GameWithRelations, RankingWithRelation } from "src/common/types";
import { useBreadcrumbsContext } from "@render//context/BreadcrumbsContext";

interface SortableItemProps {
  id: string;
  name: string;
  index?: number;
  removeFn: (id: string) => void;
}

interface GameCardProps {
  game: GameWithRelations;
  onAddToRanked: (game: GameWithRelations) => void;
  onAddToPlaceholder: (game: GameWithRelations) => void;
  rankedFull: boolean;
}

interface EmptyStateProps {
  icon: React.FC<any>;
  message: string;
}

const SortableItem = ({ id, name, index, removeFn }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: isDragging ? ("relative" as const) : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cover = await window.media.getCovers(id);
        setImage(cover[0]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group mb-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-md transition-all hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500"
    >
      <div className="flex flex-1 items-center gap-3">
        {index !== undefined && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            {index + 1}
          </div>
        )}
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
          <img src={image || ""} alt={name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 font-medium text-slate-700 dark:text-slate-200">{name}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="cursor-grab touch-none p-1 opacity-60 transition-opacity hover:opacity-100"
          {...attributes}
          {...listeners}
          type="button"
        >
          <GripVertical size={18} />
        </button>
        <button
          onClick={() => removeFn(id)}
          className="text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:hover:text-red-400"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const GameCard = ({ game, onAddToRanked, onAddToPlaceholder, rankedFull }: GameCardProps) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cover = await window.media.getCovers(game.id);
        setImage(cover[0]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, [game.id]);
  return (
    <div className="group relative mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
          <img src={image || ""} alt={game.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-800 dark:text-slate-200">{game.name}</h3>
          <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onAddToPlaceholder(game)}
              className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              type="button"
            >
              <BookmarkPlus size={12} />
              <span>Add to Placeholder</span>
            </button>
            <button
              onClick={() => onAddToRanked(game)}
              disabled={rankedFull}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                rankedFull
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-800/60"
              }`}
              type="button"
            >
              <Plus size={12} />
              <span>Add to Top 10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
    <Icon size={64} className="mb-4 opacity-50" />
    <p className="max-w-xs text-center">{message}</p>
  </div>
);

export function RankingEditPage() {
  const [ranked, setRanked] = useState<GameWithRelations[]>([]);
  const [ranking, setRanking] = useState<RankingWithRelation | null>(null);
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const [placeholder, setPlaceholder] = useState<GameWithRelations[]>([]);
  const { games, refreshGames } = useGames();
  const { id } = useParams<{ id: string }>();
  const rankingId = parseInt(id!);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (games.length === 0) {
          await refreshGames();
        }

        const data = await window.ranking.getRanking(Number(id));
        setRanking(data);

        const rankedGames: GameWithRelations[] = [];
        const placeholderGames: GameWithRelations[] = [];

        for (const game of data.rankings) {
          const foundGame = games.find((g) => g.id === game.gameId);

          if (foundGame) {
            if (game.rank) {
              rankedGames.push(foundGame as GameWithRelations);
            } else {
              placeholderGames.push(foundGame as GameWithRelations);
            }
          }
        }

        setRanked(rankedGames);
        setPlaceholder(placeholderGames);

        setBreadcrumbs([
          { path: "/", label: "Home" },
          { path: "/ranking", label: "Ranking" },
          { path: `/ranking/${rankingId}`, label: data.name },
        ]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, [id, games, refreshGames, rankingId, setBreadcrumbs]);

  useEffect(() => {
    console.log("Ranked games:", ranked);
    for (const rank of ranked) {
      window.ranking.edit({
        rankingId: rankingId,
        gameId: rank.id,
        rank: ranked.indexOf(rank) + 1,
      });
    }

    for (const rank of placeholder) {
      window.ranking.edit({
        rankingId: rankingId,
        gameId: rank.id,
        rank: null,
      });
    }
  }, [ranked, placeholder, rankingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndRanked = (event: DragEndEvent) => {
    const { active, over } = event;

    // Make sure over exists before trying to access its id
    if (over && active.id !== over.id) {
      setRanked((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Only proceed if both indices are valid
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }

        // Return original array if indices are invalid
        return items;
      });
    }
  };

  const handleDragEndPlaceholder = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPlaceholder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addToRanked = (game: GameWithRelations) => {
    if (ranked.length < 10) {
      setRanked([...ranked, game]);
    }
  };

  const addToPlaceholder = (game: GameWithRelations) => {
    setPlaceholder([...placeholder, game]);
  };

  const removeFromRanked = (id: string) => {
    window.ranking.removeGameFromRanking(rankingId, id);
    setRanked(ranked.filter((game) => game.id !== id));
  };

  const removeFromPlaceholder = (id: string) => {
    window.ranking.removeGameFromRanking(rankingId, id);
    setPlaceholder(placeholder.filter((game) => game.id !== id));
  };

  const moveToRanked = (id: string) => {
    if (ranked.length < 10) {
      const game = placeholder.find((g) => g.id === id);
      if (game) {
        setRanked([...ranked, game]);
        setPlaceholder(placeholder.filter((g) => g.id !== id));
      }
    }
  };

  const moveToPlaceholder = (id: string) => {
    const game = ranked.find((g) => g.id === id);
    if (game) {
      setPlaceholder([...placeholder, game]);
      setRanked(ranked.filter((g) => g.id !== id));
    }
  };

  const availableGames = games.filter(
    (game) =>
      game.gameStatusId === 3 && !ranked.some((g) => g.id === game.id) && !placeholder.some((g) => g.id === game.id),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
      <header className="bg-white px-6 py-4 shadow-md dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Top 10 Games Ranking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create your definitive ranking of the best video games
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* Left Column - Rankings and Placeholders */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Top 10 Ranking Section */}
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-white">
                  <ListOrdered size={20} />
                  Your Top 10 Games
                </h2>
                <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {ranked.length}/10
                </div>
              </div>

              <div className="min-h-72 rounded-xl bg-slate-200/50 p-4 dark:bg-slate-800/30">
                {ranked.length === 0 ? (
                  <EmptyState
                    icon={ListOrdered}
                    message="Your top 10 list is empty. Select games from the available list to start ranking."
                  />
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndRanked}>
                    <SortableContext items={ranked.map((game) => game.id)} strategy={verticalListSortingStrategy}>
                      {ranked.map((game, index) => (
                        <div key={game.id} className="group relative">
                          <SortableItem id={game.id} name={game.name} index={index} removeFn={removeFromRanked} />
                          <button
                            onClick={() => moveToPlaceholder(game.id)}
                            className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700 opacity-0 transition-opacity hover:bg-yellow-200 group-hover:opacity-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800/30"
                            type="button"
                          >
                            <BookmarkPlus size={12} />
                            <span>Move to Placeholder</span>
                          </button>
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Placeholder Section */}
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-white">
                  <BookmarkPlus size={20} />
                  Placeholder Games
                </h2>
                <div className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {placeholder.length}
                </div>
              </div>

              <div className="min-h-72 rounded-xl bg-slate-200/50 p-4 dark:bg-slate-800/30">
                {placeholder.length === 0 ? (
                  <EmptyState
                    icon={BookmarkPlus}
                    message="No placeholder games. Add games you're considering but haven't finalized their position."
                  />
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPlaceholder}>
                    <SortableContext items={placeholder.map((game) => game.id)} strategy={verticalListSortingStrategy}>
                      {placeholder.map((game) => (
                        <div key={game.id} className="group relative">
                          <SortableItem id={game.id} name={game.name} removeFn={removeFromPlaceholder} />
                          {ranked.length < 10 && (
                            <button
                              onClick={() => moveToRanked(game.id)}
                              className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-xs text-indigo-700 opacity-0 transition-opacity hover:bg-indigo-200 group-hover:opacity-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/30"
                              type="button"
                            >
                              <ArrowRight size={12} />
                              <span>Move to Top 10</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Available Games */}
          <div className="flex flex-col overflow-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-white">
                <Gamepad2 size={20} />
                Available Games
              </h2>
              <div className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {availableGames.length}
              </div>
            </div>

            <div className="h-full overflow-y-auto rounded-xl bg-slate-200/50 p-4 dark:bg-slate-800/30">
              {availableGames.length === 0 ? (
                <EmptyState
                  icon={Gamepad2}
                  message="All games have been added to your lists. You can remove games from your rankings to make them available again."
                />
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {availableGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game as GameWithRelations}
                      onAddToRanked={addToRanked}
                      onAddToPlaceholder={addToPlaceholder}
                      rankedFull={ranked.length >= 10}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
