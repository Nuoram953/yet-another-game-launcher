import React from "react";
import { StatsPanel } from "./StatsPanel";
import { Trailer } from "./Trailer";
import Info from "./Info";
import { Screenshots } from "./Screenshots";

export const SectionOverview = () => {
  return (
    <div className="mx-auto w-full space-y-4 py-4 mb-[100px]">
      <StatsPanel />
      <Trailer />
      <Screenshots/>
      <Info />
    </div>
  );
};
