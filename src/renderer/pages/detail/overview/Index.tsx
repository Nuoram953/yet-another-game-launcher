import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import Info from "@/components/detail/Info";

export const SectionOverview = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  // const [loading, setLoading] = useState(true);
  const { selectedGame } = useGames();

  return (
    <div className="mx-auto w-full space-y-4 py-4">
      <StatsPanel />
      <Trailer />

      <Info />
    </div>
  );
};
