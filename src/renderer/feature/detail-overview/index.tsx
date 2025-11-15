import React from "react";
import { ScreenshotsCarousel } from "./components/ScreenshotsCarousel";
import { StatsPanel } from "./components/StatsPanel";
import { Description } from "./components/Description";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { LoadingCenter } from "@render/components/new/loading/Loading";

export const DetailsOverview = () => {
  const { game, isLoading } = useGameFromParams();

  if (isLoading) return <LoadingCenter />;

  return (
    <div className="flex flex-col gap-10">
      <StatsPanel />
      <Description />
      <ScreenshotsCarousel />
      {/* <HowLongToBeatWithComparison /> */}
    </div>
  );
};
