import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import Info from "./Info";
import { Screenshots } from "./Screenshots";
import { EventTimeline } from "./Timeline";
import { HowLongToBeat } from "./HowLongToBeat";

export const SectionOverview = () => {
  return (
    <div className="mx-auto mb-[100px] w-full space-y-4 py-4">
      <StatsPanel />
      <Trailer />
      <Screenshots />
      <Info />
      <EventTimeline />
      <HowLongToBeat />
    </div>
  );
};
