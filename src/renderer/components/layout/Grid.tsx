import React, { useCallback, useMemo } from "react";
import Cover from "../Cover";
import _ from "lodash";
import { useLibraryContext } from "@/context/DatabaseContext";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const COLUMN_WIDTH = 250;
const ROW_HEIGHT = 525;
const GAP = 18;

const Grid = () => {
  const { games } = useLibraryContext();
  const [search, setSearch] = React.useState("");
  const { t } = useTranslation("common");

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    if (newSearch !== search) {
      setSearch(newSearch);
    }
  }, [search]);

  // Memoize filtered games list
  const filteredGames = useMemo(() => {
    const uniqueGames = Array.from(
      new Map(games.map((game) => [game.id, game])).values()
    );

    return search
      ? uniqueGames.filter((game) =>
          game.name.toLowerCase().includes(search.toLowerCase())
        )
      : uniqueGames;
  }, [games, search]);

  // Memoize the cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style, data }) => {
    const { games, columnCount } = data;
    const gameIndex = rowIndex * columnCount + columnIndex;
    const game = games[gameIndex];

    if (!game) return null;

    const adjustedStyle = {
      ...style,
      padding: GAP / 2,
      boxSizing: 'border-box' as const,
    };

    return (
      <div style={adjustedStyle}>
        <Cover key={game.id} game={game} />
      </div>
    );
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <p>{t("test")}</p>
      
      <div className="max-w-md mx-auto p-2">
        <Input
          type="search"
          placeholder="Search library..."
          value={search}
          onChange={handleSearch}
          className="text-white"
        />
      </div>

      <div className="flex-1 w-full p-4">
        <AutoSizer>
          {({ height, width }) => {
            // Calculate grid dimensions
            const columnCount = Math.max(1, Math.floor((width - GAP) / (COLUMN_WIDTH + GAP)));
            const rowCount = Math.ceil(filteredGames.length / columnCount);
            
            // Calculate actual column width to fill space evenly
            const availableWidth = width - GAP * (columnCount + 1);
            const adjustedColumnWidth = Math.floor(availableWidth / columnCount);

            return (
              <FixedSizeGrid
                className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={adjustedColumnWidth + GAP}
                rowHeight={ROW_HEIGHT + GAP}
                height={height}
                width={width}
                itemData={{
                  games: filteredGames,
                  columnCount,
                }}
                overscanColumnsCount={1}
                overscanRowsCount={1}
              >
                {Cell}
              </FixedSizeGrid>
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
};

export default Grid;
