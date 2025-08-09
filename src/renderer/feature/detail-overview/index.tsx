import React from "react";
import { ScreenshotsCarousel } from "./components/ScreenshotsCarousel";
import { StatsPanel } from "./components/StatsPanel";
import { Tags } from "./components/Tags";
import { HowLongToBeatWithComparison } from "./components/HowLongToBeat";

export const DetailsOverview = () => {
  return (
    <div className="flex flex-col gap-10">
      <StatsPanel />
      <ScreenshotsCarousel />
      <Tags />
      <HowLongToBeatWithComparison />
    </div>
  );
};
