import { Game } from "@prisma/client";
import React from "react";
import { Card } from "../ui/card";
import {
  Activity,
  Calendar,
  Clock,
  Trophy,
} from "lucide-react";
import { useGames } from "@/context/DatabaseContext";

export const Summary = () => {
  const {selectedGame} = useGames()

  return (
    <Card className="flex flex-row gap-8 m-6 p-6 bg-stone-700/40 backdrop-blur-md border-white/50 shadow-xl justify-evenly">
      <div className="flex flex-row gap-3 items-center">
        <Clock />
        <div className="flex flex-col">
          <h2 className="font-bold">Time Played</h2>
          <p>2h 0m</p>
        </div>
      </div>
      <div className="flex flex-row gap-3 items-center">
        <Trophy />
        <div className="flex flex-col">
          <h2 className="font-bold">Achievements</h2>
          <p>15/50</p>
        </div>
      </div>
      <div className="flex flex-row gap-3 items-center">
        <Activity />
        <div className="flex flex-col">
          <h2 className="font-bold">Status</h2>
          <p>Playing</p>
        </div>
      </div>
      <div className="flex flex-row gap-3 items-center">
        <Calendar />
        <div className="flex flex-col">
          <h2 className="font-bold">Last Played</h2>
          <p>Jan 19, 2025</p>
        </div>
      </div>
    </Card>
  );
};
