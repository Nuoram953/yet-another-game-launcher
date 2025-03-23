import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import Info from "./Info";
import { Screenshots } from "./Screenshots";
import { GameStatusTimeline } from "./GameStatusTimeline";
import { EventTimeline } from "./Timeline";

export const SectionOverview = () => {
  return (
    <div className="mx-auto w-full space-y-4 py-4 mb-[100px]">
      <StatsPanel />
      <Trailer />
      <Screenshots/>
      <Info />
      <EventTimeline />
    </div>
  );
};
