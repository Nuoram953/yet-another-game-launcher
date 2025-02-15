import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import ScoreCircle from "./ScoreCircle";
import { Tile } from "./Tile";
import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeveloperShowcase, { Company } from "./overview/Company";
import Info from "@/components/detail/Info";

export const SectionOverview = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  // const [loading, setLoading] = useState(true);
  const { selectedGame } = useGames();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
      <StatsPanel />
      <Trailer />

      <Info />

      {/*
      <div className="flex flex-1 flex-row">
        {selectedGame.developers.map((dev) => (
          <DeveloperShowcase developer={dev.company} />
        ))}

        {selectedGame?.publishers.map((dev) => (
          <DeveloperShowcase developer={dev.company} />
        ))}
      </div>
      */}

      <Tile>
        <CardHeader>
          <CardTitle>Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row justify-evenly">
            <ScoreCircle score={selectedGame.scoreCritic} label="Critic" />
            <ScoreCircle
              score={selectedGame.scoreCommunity}
              label="Community"
            />
            {selectedGame?.review?.score && (
              <ScoreCircle
                score={selectedGame?.review?.score * 10 ?? null}
                label="User"
              />
            )}
          </div>
        </CardContent>
      </Tile>

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
