import React, { useEffect, useState } from "react";
import SearchWithFilters from "../SearchWithFilters";
import Cover from "../Cover";
import _ from "lodash";
import { useLibraryContext } from "@/context/DatabaseContext";
import { Input } from "../ui/input";

const Grid = () => {
  const { games } = useLibraryContext();
  const [search, setSearch] = React.useState("");

  const handleSearch = (e) => {
    const newSearch = e.target.value;
    if (newSearch !== search) {
      setSearch(newSearch);
    }
  };

  const uniqueGames = Array.from(new Map(games.map(game => [game.id, game])).values());

  const filteringGames = search
    ? uniqueGames.filter((game) =>
        game.name.toLowerCase().includes(search.toLowerCase())
      )
    : uniqueGames;


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Search movies..."
          value={search}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      <div className="w-full p-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {filteringGames.map((game) => (
            <Cover key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;
