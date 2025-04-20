import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cover from "./cover/Cover";
import _ from "lodash";
import { useGames } from "@/context/DatabaseContext";

//@ts-ignore
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { RecentlyPlayedCarousel } from "./RecentlyPlayedCarousel";
import useGridScrollPersist from "@/hooks/usePersistentScroll";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Filters } from "./Filter";
import { Button } from "@/components/button/Button";
import { Filter, Plus, Search } from "lucide-react";
import { Sort } from "./Sort";
import { Input } from "@/components/input/Input";

const COLUMN_WIDTH = 275;
const ROW_HEIGHT = 520;
const GAP = 16;

export const Grid = () => {
  const { games, loading, error, refreshGames, updateFilters } = useGames();
  const [search, setSearch] = React.useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchBarExpanded, setSearchBarExpanded] = useState(false);
  const { updateSelectedGame } = useGames();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const gridRef = useRef(null);

  useEffect(() => {
    setBreadcrumbs([]);
    refreshGames();
  }, []);

  useGridScrollPersist("unique-grid-id", gridRef);

  updateSelectedGame(null);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearch = e.target.value;
      if (newSearch !== search) {
        setSearch(newSearch);
      }
    },
    [search],
  );

  const filteredGames = useMemo(() => {
    const uniqueGames = Array.from(
      new Map(games.map((game) => [game.id, game])).values(),
    );

    return search
      ? uniqueGames.filter((game) =>
          game.name.toLowerCase().includes(search.toLowerCase()),
        )
      : uniqueGames;
  }, [games, search]);

  const Cell = useCallback(
    ({
      columnIndex,
      rowIndex,
      style,
      data,
    }: {
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
      data: any;
    }) => {
      const { games, columnCount, cellWidth, cellHeight } = data;
      const gameIndex = rowIndex * columnCount + columnIndex;
      const game = games[gameIndex];

      if (!game) return null;

      const cellStyle = {
        ...style,
        padding: `0 ${GAP / 2}px ${GAP}px ${GAP / 2}px`,
      };

      return (
        <div style={cellStyle}>
          <Cover key={game.id} game={game} />
        </div>
      );
    },
    [],
  );

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-lg">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <RecentlyPlayedCarousel />
      <div className="flex-none">
        <div className="flex flex-row items-center justify-between bg-white p-2 align-middle shadow-md dark:bg-slate-800">
          <div className="flex w-1/3 flex-row items-center p-4 align-middle">
            {searchBarExpanded ? (
              <Input
                color={"dark"}
                type="search"
                placeholder="Search library..."
                value={search}
                onChange={handleSearch}
              />
            ) : (
              <Button
                intent={"icon"}
                icon={Search}
                size={"fit"}
                onClick={() => {
                  setSearchBarExpanded(true);
                }}
              />
            )}
            <div className="ml-2 flex flex-row">
              <Button
                intent={"icon"}
                icon={Filter}
                size={"fit"}
                onClick={() => {
                  setIsExpanded(!isExpanded);
                }}
              />
              <Sort />
            </div>
          </div>
          <div>
            <Button
              intent={"primary"}
              text="Add game"
              icon={Plus}
              size={"small"}
              className="w-fit"
              onClick={() => {}}
            />
          </div>
        </div>
        <Filters expand={isExpanded} />
      </div>

      <div className="mt-8 min-h-0 flex-1">
        <AutoSizer>
          {({ height, width }) => {
            const availableWidth = width;

            const columnCount = Math.max(
              1,
              Math.floor((availableWidth + GAP) / (COLUMN_WIDTH + GAP)),
            );

            const rowCount = Math.ceil(filteredGames.length / columnCount);

            const adjustedColumnWidth = Math.floor(
              (availableWidth - (columnCount - 1) * GAP) / columnCount,
            );

            return (
              <FixedSizeGrid
                ref={gridRef}
                className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={adjustedColumnWidth + GAP}
                rowHeight={ROW_HEIGHT + GAP + 40}
                width={width}
                height={height}
                itemData={{
                  games: filteredGames,
                  columnCount,
                  cellWidth: adjustedColumnWidth,
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
