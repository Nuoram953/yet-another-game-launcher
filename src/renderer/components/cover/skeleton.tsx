import { Skeleton } from "../ui/skeleton";
import React from "react";

export const SkeletonCover = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="rounded-xl h-[400px]" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[75px]" />
      </div>
    </div>
  );
};
