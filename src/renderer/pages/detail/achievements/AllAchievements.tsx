import { useGames } from "@render//context/DatabaseContext";
import { CheckCircle, EyeOff, Lock, Medal, Filter, Search, Clock, Trophy, Target, Award } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { unixToDate } from "@render//utils/util";
import { Checkbox } from "@render//components/ui/checkbox";
import { Progress } from "@render//components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@render//components/ui/select";
import AchievementTimeline from "./AchievementTimeline";
import { Card } from "@render//components/card/Card";
import { Badge } from "@render//components/ui/badge";
import { Input } from "@render//components/input/Input";
import { useTranslation } from "react-i18next";
import { getMedia } from "@render/api/electron";
import { AchievementHighlights } from "./Hightlights";
import { AchievementOverview } from "./Overview";
import { LOCALE_NAMESPACE } from "@common/constant";

export const AchievementAll = () => {
  const { t } = useTranslation();
  const [achievementLogos, setAchievementLogos] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "unlocked" | "locked">("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  const { selectedGame } = useGames();

  const activeFiltersCount = (hideUnlocked ? 1 : 0) + (hideHidden ? 1 : 0) + (viewMode !== "all" ? 1 : 0);

  useEffect(() => {
    const fetchAchievementLogos = async () => {
      try {
        const resources = await getMedia().getAchievements(selectedGame!.id);
        setAchievementLogos(resources);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievement images:", error);
        setLoading(false);
      }
    };

    if (selectedGame?.id) {
      fetchAchievementLogos();
    }
  }, [selectedGame?.id]);

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
    if (!selectedGame?.achievements) return [];

    return selectedGame.achievements
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
  }, [selectedGame?.achievements, viewMode, hideUnlocked, hideHidden, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-md flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-design-text-subtle" />
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
          className="flex items-center gap-2 rounded-md border border-design-border px-3 py-2 text-sm hover:bg-design-background"
        >
          <Filter className="h-4 w-4" />
          {t("achievements.all.filter.advanced", { ns: LOCALE_NAMESPACE.DETAIL })}
          {activeFiltersCount > 0 && <Badge className="ml-1 bg-primary text-xs">{activeFiltersCount}</Badge>}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-md border border-design-border bg-design-foreground p-4">
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

      <div className="flex items-center justify-between text-sm text-design-text-subtle">
        <span>Showing {filteredAchievements.length} achievements</span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">
            {t("achievements.all.search.clear", { ns: LOCALE_NAMESPACE.DETAIL })}
          </button>
        )}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-design-foreground p-4">
            <Search className="h-8 w-8 text-design-text-subtle" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No achievements found</h3>
          <p className="mb-4 text-sm text-design-text-subtle">
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
              className="text-sm text-primary hover:underline"
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
                    src={achievementLogos.find((logo) => logo.includes(`achievement/${achievement.externalId}.`))}
                    alt={achievement.name}
                    className="h-12 w-12 rounded-md object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-design-border bg-design-foreground">
                    <Lock className="h-6 w-6 text-design-text-subtle" />
                  </div>
                )}
              </div>

              <div className="mr-4 min-w-0 flex-grow">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-design-text-normal transition-colors group-hover:text-primary">
                    {achievement.name}
                  </h3>
                  {achievement.isHidden && <EyeOff className="h-4 w-4 flex-shrink-0 text-design-text-subtle" />}
                  {achievement.rarity && achievement.rarity < 10 && (
                    <Award className="h-4 w-4 flex-shrink-0 text-purple-500" />
                  )}
                </div>
                <p className="text-sm text-design-text-normal">{achievement.description}</p>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end space-y-1 text-right">
                {achievement.isUnlocked ? (
                  <>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span className="font-medium">Unlocked</span>
                    </div>
                    <div className="text-xs text-design-text-subtle">{unixToDate(Number(achievement.unlockedAt))}</div>
                  </>
                ) : (
                  <div className="text-sm font-medium text-design-text-subtle">Locked</div>
                )}

                {achievement.rarity && (
                  <div className="text-xs text-design-text-subtle">{achievement.rarity.toFixed(1)}% unlocked</div>
                )}
              </div>
            </div>

            {achievement.isUnlocked && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-design-achievement-unlocked-underline" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
