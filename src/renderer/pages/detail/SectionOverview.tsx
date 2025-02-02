import { useGames } from "@/context/DatabaseContext";
import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import ScoreCircle from "./ScoreCircle";
import { Info } from "@/components/detail/Info";
import { Tile } from "./Tile";
import { Calendar } from "@/components/ui/calendar";

export const SectionOverview = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { selectedGame } = useGames();

  return (
    <div className="animate-fadeIn min-h-[2000px] space-y-6">
      <StatsPanel />
      <Trailer />

      <div className="mx-auto">
        <div className="flex w-full flex-row justify-around gap-4">
          <div
            className="flex-1 flex-grow transform rounded-lg bg-gray-800 p-4 transition-all duration-300 hover:scale-105"
            style={{
              animationDelay: `${1 * 100}ms`,
              animation: "slideUp 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-sm text-gray-400">Developer</h3>
            {selectedGame.developers.map((dev) => (
              <p>{dev.company.name}</p>
            ))}
          </div>

          <div
            className="flex-1 flex-grow transform rounded-lg bg-gray-800 p-4 transition-all duration-300 hover:scale-105"
            style={{
              animationDelay: `${2 * 100}ms`,
              animation: "slideUp 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-sm text-gray-400">Publisher</h3>
            {selectedGame.publishers.map((dev) => (
              <p>{dev.company.name}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex-grow rounded-lg bg-gray-800 p-4">
        <Info />
      </div>

      <div className="flex-1 flex-grow rounded-lg bg-gray-800 p-4">
        <div className="flex flex-row justify-evenly">
          <ScoreCircle score={selectedGame.scoreCritic} label="Critic" />
          <ScoreCircle score={selectedGame.scoreCommunity} label="Community" />
          <ScoreCircle score={selectedGame.scoreUser} label="User" />
        </div>
      </div>

      <Tile>
        <div className="flew-row flex justify-evenly">
          <div className="flex flex-col items-center justify-center">
            <h3>Release date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3>Release date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h3>Release date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
        </div>
      </Tile>
      <div className="h-20"></div>
    </div>
  );
};
