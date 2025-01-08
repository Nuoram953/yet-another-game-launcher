import React from "react";
import SearchWithFilters from "../SearchWithFilters";
import Cover from "../Cover";
import _ from "lodash";
import { useLibraryContext } from "@/context/DatabaseContext";

const Grid = () => {
  const {games} = useLibraryContext()



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SearchWithFilters />
      <div className="w-full p-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {games.map((game) => (
            <Cover game={game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;
