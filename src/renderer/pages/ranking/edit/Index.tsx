import { Container } from "@/components/Container";
import { Card } from "@/components/card/Card";
import { useGames } from "@/context/DatabaseContext";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RankingCover } from "../RankingCover";

export function RankingEditPage() {
  const { id } = useParams<{ id: string }>();
  const { games } = useGames();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for ranked games in the pyramid
  const [rankedGames, setRankedGames] = useState(Array(10).fill(null));

  // Track which item is being dragged
  const [draggedGame, setDraggedGame] = useState(null);

  const handleDragStart = (game) => {
    setDraggedGame(game);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();

    if (!draggedGame) return;

    // Create a copy of current rankings
    const newRankedGames = [...rankedGames];

    // If dragging from available games
    if (!draggedGame.currentIndex && draggedGame.currentIndex !== 0) {
      newRankedGames[index] = draggedGame;
    }
    // If reordering within pyramid
    else {
      // Remove from old position
      newRankedGames[draggedGame.currentIndex] = null;
      // Add to new position
      newRankedGames[index] = { ...draggedGame };
      delete newRankedGames[index].currentIndex;
    }

    setRankedGames(newRankedGames);
    setDraggedGame(null);
  };

  const handleRemove = (index) => {
    const newRankedGames = [...rankedGames];
    newRankedGames[index] = null;
    setRankedGames(newRankedGames);
  };

  const fetchCover = async (id: string): Promise<string | undefined> => {
    try {
      const covers = await window.media.getCovers(id, 1);
      return covers?.[0];
    } catch (error) {
      console.error("Failed to fetch cover:", error);
      return undefined;
    }
  };

  // Calculate remaining games (exclude ones already in pyramid)
  const remainingGames = games.filter(
    (game) =>
      !rankedGames.some(
        (rankedGame) => rankedGame && rankedGame.id === game.id,
      ),
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Loading games...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-red-50 p-4">
        <div className="mb-2 text-xl font-semibold text-red-500">Error</div>
        <p className="text-gray-700">{error}</p>
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Create the pyramid structure with appropriate sizing
  const pyramidSlots = [
    { row: 1, cols: 1 }, // Top (1st place)
    { row: 2, cols: 2 }, // 2nd & 3rd
    { row: 3, cols: 3 }, // 4th, 5th, 6th
    { row: 4, cols: 4 }, // 7th, 8th, 9th, 10th
  ];

  return (
    <Container>
      <h1 className="mb-6 text-center text-3xl font-bold text-blue-800">
        My Top 10 Video Games
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Drag and drop your favorite games to create your personal ranking
        pyramid
      </p>

      <div className="flex flex-col gap-8">
        {/* Left side - Pyramid */}
        <Card title={"Your Top 10 Ranking"}>
          <div className="flex flex-col items-center gap-4">
            {pyramidSlots.map((slotRow, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex w-full justify-center gap-4"
              >
                {Array.from({ length: slotRow.cols }).map((_, colIndex) => {
                  // Calculate the absolute index in our flat array
                  let absoluteIndex;
                  if (rowIndex === 0) absoluteIndex = 0;
                  else if (rowIndex === 1) absoluteIndex = 1 + colIndex;
                  else if (rowIndex === 2) absoluteIndex = 3 + colIndex;
                  else absoluteIndex = 6 + colIndex;

                  const game = rankedGames[absoluteIndex];
                  const rank = absoluteIndex + 1;

                  return (
                    <div
                      key={`slot-${absoluteIndex}`}
                      className={`relative border-2 ${game ? "border-green-500" : "border-dashed border-gray-300"} rounded-lg ${rowIndex === 0 ? "h-40 w-32" : "h-32 w-24"} flex items-center justify-center bg-gray-50`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, absoluteIndex)}
                    >
                      {game ? (
                        <div
                          className="relative h-full w-full"
                          draggable
                          onDragStart={() =>
                            handleDragStart({
                              ...game,
                              currentIndex: absoluteIndex,
                            })
                          }
                        >
                          <RankingCover id={game.id} />
                          <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-br-lg bg-blue-600 font-bold text-white">
                            {rank}
                          </div>
                          <button
                            className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-bl-lg bg-red-500 text-white"
                            onClick={() => handleRemove(absoluteIndex)}
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 truncate bg-black bg-opacity-70 p-1 text-xs text-white">
                            {game.name}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-400">
                          <div className="mb-1 font-bold">#{rank}</div>
                          <div>Drop game here</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Right side - Available games */}
        <div className="h-screen">
          <div className="grid max-h-full flex-grow grid-cols-2 gap-4 overflow-scroll sm:grid-cols-3">
            {remainingGames.map((game) => (
              <div
                key={game.id}
                className="relative my-4 cursor-move rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                draggable
                onDragStart={() => handleDragStart(game)}
              >
                <RankingCover id={game.id} />
                <div className="bg-white p-2">
                  <h3
                    className="truncate text-sm font-medium"
                    title={game.name}
                  >
                    {game.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {remainingGames.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            All games have been ranked!
          </div>
        )}
      </div>
    </Container>
  );
}
