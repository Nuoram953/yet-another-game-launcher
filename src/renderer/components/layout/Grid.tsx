import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "./ui/card";
import SearchWithFilters from "../SearchWithFilters";
import Cover from "../Cover";
import _ from "lodash";
import { IGame } from "@common/types";

const Grid: React.FC<{ games: IGame[] }> = ({ games }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SearchWithFilters />
      <div className="w-full p-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
          {games.map((game) => (
            <Cover game={game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;
