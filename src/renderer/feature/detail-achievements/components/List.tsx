import { useGames } from "@render//context/DatabaseContext";
import { CheckCircle, EyeOff, Lock, Medal, Filter, Search, Clock, Trophy, Target, Award } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { unixToDate } from "@render//utils/util";
import { Checkbox } from "@render//components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@render//components/ui/select";
import { Badge } from "@render//components/ui/badge";
import { Input } from "@render//components/input/Input";
import { useTranslation } from "react-i18next";
import { getMedia } from "@render/api/electron";
import { LOCALE_NAMESPACE } from "@common/constant";
import useGameStore from "@render/feature/detail/store/GameStore";
import { Card } from "@render/components/card/Card";
import { useQuery } from "@tanstack/react-query";
import { getGameAchievements } from "../api/DetailAchievementsApi";
import { useParams } from "react-router-dom";
import { useGame } from "@render/api/get-game";
import { LoadingCenter } from "@render/components/new/loading/Loading";

export const List = () => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "unlocked" | "locked">("all");
  const [sortBy, setSortBy] = useState("date");

  const { id } = useParams<{ id: string }>();
  const gameQuery = useGame({ gameId: id });

  const { data, isPending } = useQuery({
    queryKey: ["game", id, "achievements"],
    queryFn: () => getGameAchievements(id),
  });

  if (gameQuery.isPending) {
    return <LoadingCenter />;
  }

  const game = gameQuery.data;

  const unlockedAchievements = game?.achievements?.filter((a) => a.isUnlocked);

  const mostCommon = unlockedAchievements.reduce((prev, current) => (current.rarity > prev.rarity ? current : prev));
  const rarest = unlockedAchievements.reduce((prev, current) => (current.rarity < prev.rarity ? current : prev));
  const firstAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : Infinity;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : Infinity;
    return currentTime < prevTime ? current : prev;
  });
  const latestAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : 0;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : 0;
    return currentTime > prevTime ? current : prev;
  });

  const sortAchievements = (a: any, b: any) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        if (a.isUnlocked && b.isUnlocked) {
          const aUnlockedAt = a.unlockedAt ? new Date(Number(a.unlockedAt)).getTime() : 0;
          const bUnlockedAt = b.unlockedAt ? new Date(Number(b.unlockedAt)).getTime() : 0;
          return bUnlockedAt - aUnlockedAt;
        }
        return Number(b.isUnlocked) - Number(a.isUnlocked);
      case "rarity":
        return (a.rarity || 100) - (b.rarity || 100);
      case "alphabetical":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  };

  const filteredAchievements = useMemo(() => {
    if (!game?.achievements) return [];

    return game.achievements
      .filter((achievement) => {
        if (viewMode === "unlocked" && !achievement.isUnlocked) return false;
        if (viewMode === "locked" && achievement.isUnlocked) return false;

        if (hideUnlocked && achievement.isUnlocked) return false;
        if (hideHidden && achievement.isHidden) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            achievement.name.toLowerCase().includes(query) || achievement.description?.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort(sortAchievements);
  }, [game?.achievements, viewMode, hideUnlocked, hideHidden, searchQuery, sortBy]);

  const activeFiltersCount = (hideUnlocked ? 1 : 0) + (hideHidden ? 1 : 0) + (viewMode !== "all" ? 1 : 0);

  return (
    <Card title="All achievements">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-md flex-grow">
            <Search className="text-design-text-subtle absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              color="dark"
              placeholder={t("achievements.all.search.placeholder", { ns: LOCALE_NAMESPACE.DETAIL })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{t("achievements.all.sort.options.recent", { ns: LOCALE_NAMESPACE.DETAIL })}</span>
                </div>
              </SelectItem>
              <SelectItem value="alphabetical">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{t("achievements.all.sort.options.aplphabetical", { ns: LOCALE_NAMESPACE.DETAIL })}</span>
                </div>
              </SelectItem>
              <SelectItem value="rarity">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  <span>{t("achievements.all.sort.options.rarity", { ns: LOCALE_NAMESPACE.DETAIL })}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border-design-border hover:bg-design-background flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            {t("achievements.all.filter.advanced", { ns: LOCALE_NAMESPACE.DETAIL })}
            {activeFiltersCount > 0 && <Badge className="bg-primary ml-1 text-xs">{activeFiltersCount}</Badge>}
          </button>
        </div>

        {showFilters && (
          <div className="border-design-border bg-design-foreground rounded-md border p-4">
            <h4 className="mb-3 text-sm font-medium">Advanced Filters</h4>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox checked={hideUnlocked} onCheckedChange={(checked) => setHideUnlocked(checked === true)} />
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {t("achievements.all.filter.hideUnlocked", { ns: LOCALE_NAMESPACE.DETAIL })}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox checked={hideHidden} onCheckedChange={(checked) => setHideHidden(checked === true)} />
                <span className="flex items-center gap-1">
                  <EyeOff className="h-4 w-4" />
                  {t("achievements.all.filter.hideHidden", { ns: LOCALE_NAMESPACE.DETAIL })}
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="text-design-text-subtle flex items-center justify-between text-sm">
          <span>Showing {filteredAchievements.length} achievements</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">
              {t("achievements.all.search.clear", { ns: LOCALE_NAMESPACE.DETAIL })}
            </button>
          )}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <div className="bg-design-foreground mb-4 rounded-full p-4">
              <Search className="text-design-text-subtle h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No achievements found</h3>
            <p className="text-design-text-subtle mb-4 text-sm">
              {searchQuery ? "Try a different search term" : "Try adjusting your filters"}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setViewMode("all");
                  setHideUnlocked(false);
                  setHideHidden(false);
                }}
                className="text-primary text-sm hover:underline"
              >
                {t("achievements.all.search.clear", { ns: LOCALE_NAMESPACE.DETAIL })}
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={`achievement-${achievement.id}`}
              className={`group relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md ${
                achievement.isUnlocked
                  ? "border-design-achievement-unlocked-border bg-gradient-to-r from-green-50/5 to-transparent"
                  : "border-design-achievement-locked-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center p-4">
                <div className="mr-4 flex-shrink-0">
                  {achievement.isUnlocked ? (
                    <img
                      src={data?.find((logo) => logo.includes(`achievement/${achievement.externalId}.`))}
                      alt={achievement.name}
                      className="h-12 w-12 rounded-md object-contain"
                    />
                  ) : (
                    <div className="border-design-border bg-design-foreground flex h-12 w-12 items-center justify-center rounded-md border">
                      <Lock className="text-design-text-subtle h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="mr-4 min-w-0 flex-grow">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-design-text-normal group-hover:text-primary font-semibold transition-colors">
                      {achievement.name}
                    </h3>
                    {achievement.isHidden && <EyeOff className="text-design-text-subtle h-4 w-4 flex-shrink-0" />}
                    {achievement.rarity && achievement.rarity < 10 && (
                      <Award className="text-design-achievement-rarity-rare h-4 w-4 flex-shrink-0" />
                    )}

                    {firstAchievement.id === achievement.id && (
                      <Target className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    )}

                    {latestAchievement.id === achievement.id && (
                      <Trophy className="h-4 w-4 flex-shrink-0 text-green-500" />
                    )}

                    {mostCommon.id === achievement.id && <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-500" />}

                    {rarest.id === achievement.id && <Award className="h-4 w-4 flex-shrink-0 text-purple-500" />}
                  </div>
                  <p className="text-design-text-normal text-sm">{achievement.description}</p>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end space-y-1 text-right">
                  {achievement.isUnlocked ? (
                    <>
                      <div className="text-design-achievement-unlocked flex items-center text-sm">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        <span className="font-medium">Unlocked</span>
                      </div>
                      <div className="text-design-text-subtle text-xs">
                        {unixToDate(Number(achievement.unlockedAt))}
                      </div>
                    </>
                  ) : (
                    <div className="text-design-text-subtle text-sm font-medium">Locked</div>
                  )}

                  {achievement.rarity && (
                    <div className="text-design-text-subtle text-xs">{achievement.rarity.toFixed(1)}% unlocked</div>
                  )}
                </div>
              </div>

              {achievement.isUnlocked && (
                <div className="bg-design-achievement-unlocked-underline absolute inset-x-0 bottom-0 h-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
