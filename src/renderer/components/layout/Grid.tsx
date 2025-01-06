import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "./ui/card";
import SearchWithFilters from "../SearchWithFilters";
import Cover from "../Cover";
import _ from "lodash";

const Grid: React.FC<{ games: any }> = ({ games }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SearchWithFilters />
      <div className="text-center mx-10">
        <div className="flex flex-row flex-wrap gap-2">
          {!_.isEmpty(games) &&
            games.map((game) => (
              <Cover fileName={"the_last_of_us_part_1.webp"} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;
