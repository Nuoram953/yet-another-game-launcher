import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import Info from "./Info";

export const SectionOverview = () => {
  return (
    <div className="mx-auto w-full space-y-4 py-4 mb-[100px]">
      <StatsPanel />
      <Trailer />
      <Info />
    </div>
  );
};
