import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cover from "../../components/Cover";
import _ from "lodash";
import { useGames } from "@/context/DatabaseContext";
import { Input } from "../../components/ui/input";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { RecentlyPlayedCarousel } from "../../components/carousel/recentlyPlayed/RecentlyPlayedCarousel";
import useGridScrollPersist from "@/hooks/usePersistentScroll";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Filters } from "./Filter";
import { Button } from "@/components/button/Button";
import { CalendarFoldIcon, FilterIcon } from "lucide-react";

const COLUMN_WIDTH = 275;
const ROW_HEIGHT = 520;
const GAP = 16;

export const Grid = () => {
  const { games, loading, error, refreshGames, updateFilters } = useGames();
  const [search, setSearch] = React.useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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

  const Cell = useCallback(({ columnIndex, rowIndex, style, data }) => {
    const { games, columnCount } = data;
    const gameIndex = rowIndex * columnCount + columnIndex;
    const game = games[gameIndex];

    if (!game) return null;

    const adjustedStyle = {
      ...style,
      padding: GAP / 2,
      boxSizing: "border-box" as const,
    };

    return (
      <div style={adjustedStyle}>
        <Cover key={game.id} game={game} />
      </div>
    );
  }, []);

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
    <div className="flex h-screen flex-col overflow-hidden">
      <RecentlyPlayedCarousel />
      <div className="flex-none">
        <div className="mx-auto flex max-w-md flex-row p-2">
          <Input
            type="search"
            placeholder="Search library..."
            value={search}
            onChange={handleSearch}
            className="text-white"
          />
          <Button
            intent={"primary"}
            icon={FilterIcon}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          />
        </div>
        <Filters expand={isExpanded} />
      </div>

      <div className="min-h-0 flex-1">
        <AutoSizer>
          {({ height, width }) => {
            const columnCount = Math.max(
              1,
              Math.floor((width - GAP) / (COLUMN_WIDTH + GAP)),
            );
            const rowCount = Math.ceil(filteredGames.length / columnCount);
            const availableWidth = width - GAP * (columnCount + 1);
            const adjustedColumnWidth = Math.floor(
              availableWidth / columnCount,
            );

            return (
              <FixedSizeGrid
                ref={gridRef}
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
