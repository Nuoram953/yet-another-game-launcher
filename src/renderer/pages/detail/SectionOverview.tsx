import { useGames } from "@/context/DatabaseContext";
import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import ScoreCircle from "./ScoreCircle";
import { Info } from "@/components/detail/Info";

export const SectionOverview = () => {
  const { selectedGame } = useGames();

  return (
    <div className="space-y-6 animate-fadeIn min-h-[1500px]">
      <StatsPanel />
      <Trailer />

      <div className="mx-auto py-4">
        <div className="flex flex-row justify-around gap-4 w-full">
          <div
            className="bg-gray-800 flex-grow flex-1 p-4 rounded-lg transform hover:scale-105 transition-all duration-300"
            style={{
              animationDelay: `${1 * 100}ms`,
              animation: "slideUp 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-gray-400 text-sm">Developer</h3>
            {selectedGame.developers.map((dev) => (
              <p>{dev.company.name}</p>
            ))}
          </div>

          <div
            className="bg-gray-800 flex-grow flex-1 p-4 rounded-lg transform hover:scale-105 transition-all duration-300"
            style={{
              animationDelay: `${2 * 100}ms`,
              animation: "slideUp 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-gray-400 text-sm">Publisher</h3>
            {selectedGame.publishers.map((dev) => (
              <p>{dev.company.name}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 flex-grow flex-1 rounded-lg p-4">
        <Info />
      </div>

      <div className="bg-gray-800 flex-grow flex-1 rounded-lg p-4">
        <div className="flex flex-row justify-between">
          <ScoreCircle score={selectedGame.scoreCritic} label="Critic" />
          <ScoreCircle score={selectedGame.scoreCommunity} label="Community" />
          <ScoreCircle score={selectedGame.scoreUser} label="User" />
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};
