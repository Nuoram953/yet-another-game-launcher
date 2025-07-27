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

// Achievement Highlights Component
const AchievementHighlights = ({
  achievements,
  achievementLogos,
}: {
  achievements: any[];
  achievementLogos: string[];
}) => {
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked && a.rarity);

  if (unlockedAchievements.length === 0) return null;

  // Most Common (highest percentage)
  const mostCommon = unlockedAchievements.reduce((prev, current) => (current.rarity > prev.rarity ? current : prev));

  // Rarest (lowest percentage)
  const rarest = unlockedAchievements.reduce((prev, current) => (current.rarity < prev.rarity ? current : prev));

  // First Achievement (earliest unlock time)
  const firstAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : Infinity;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : Infinity;
    return currentTime < prevTime ? current : prev;
  });

  // Latest Achievement (most recent unlock)
  const latestAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : 0;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : 0;
    return currentTime > prevTime ? current : prev;
  });

  // Hidden Achievement Count
  const hiddenUnlocked = achievements.filter((a) => a.isUnlocked && a.isHidden).length;

  // Quick consecutive achievements (unlocked within 24 hours of each other)
  const sortedByTime = unlockedAchievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => Number(a.unlockedAt) - Number(b.unlockedAt));

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedByTime.length; i++) {
    const timeDiff = Number(sortedByTime[i].unlockedAt) - Number(sortedByTime[i - 1].unlockedAt);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff <= 24) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  const AchievementCard = ({ achievement, title, subtitle, icon, iconColor }: any) => (
    <div className="rounded-lg border border-design-border bg-design-foreground p-4 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img
            src={achievementLogos.find((logo) => logo.includes(`achievement/${achievement.externalId}.`))}
            alt={achievement.name}
            className="h-12 w-12 rounded-md object-contain"
          />
        </div>
        <div className="min-w-0 flex-grow">
          <div className="mb-1 flex items-center gap-2">
            <div className={`rounded-full p-1 ${iconColor}`}>{icon}</div>
            <span className="text-xs font-medium uppercase tracking-wide text-design-text-subtle">{title}</span>
          </div>
          <h4 className="truncate font-semibold text-design-text-normal">{achievement.name}</h4>
          <p className="text-sm text-design-text-subtle">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Featured Achievements Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AchievementCard
          achievement={rarest}
          title="Rarest Achievement"
          subtitle={`Only ${rarest.rarity.toFixed(1)}% of players have this`}
          icon={<Award className="h-4 w-4 text-purple-500" />}
          iconColor="bg-purple-100 dark:bg-purple-900/30"
        />

        <AchievementCard
          achievement={mostCommon}
          title="Most Common"
          subtitle={`${mostCommon.rarity.toFixed(1)}% of players have this`}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          iconColor="bg-yellow-100 dark:bg-yellow-900/30"
        />

        <AchievementCard
          achievement={firstAchievement}
          title="First Achievement"
          subtitle={`Unlocked on ${unixToDate(Number(firstAchievement.unlockedAt))}`}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          iconColor="bg-blue-100 dark:bg-blue-900/30"
        />

        <AchievementCard
          achievement={latestAchievement}
          title="Latest Achievement"
          subtitle={`Unlocked on ${unixToDate(Number(latestAchievement.unlockedAt))}`}
          icon={<Clock className="h-4 w-4 text-green-500" />}
          iconColor="bg-green-100 dark:bg-green-900/30"
        />
      </div>

      {/* Fun Stats */}
      <div className="flex flex-grow flex-row gap-4">
        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">{maxStreak}</div>
          <div className="text-xs text-design-text-subtle">Max Daily Streak</div>
        </div>

        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">
            {unlockedAchievements.filter((a) => a.rarity < 5).length}
          </div>
          <div className="text-xs text-design-text-subtle">Ultra Rare (&lt;5%)</div>
        </div>

        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">
            {(unlockedAchievements.reduce((sum, a) => sum + (100 - a.rarity), 0) / unlockedAchievements.length).toFixed(
              0,
            )}
          </div>
          <div className="text-xs text-design-text-subtle">Avg. Rarity Score</div>
        </div>
      </div>
    </div>
  );
};

export const SectionAchievements = () => {
  const [achievementLogos, setAchievementLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "unlocked" | "locked">("all");
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchAchievementLogos = async () => {
      try {
        const resources = await window.media.getAchievements(selectedGame!.id);
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

  // Memoized calculations for better performance
  const achievementStats = useMemo(() => {
    if (!selectedGame?.achievements) return null;

    const total = selectedGame.achievements.length;
    const unlocked = selectedGame.achievements.filter((a) => a.isUnlocked).length;
    const hidden = selectedGame.achievements.filter((a) => a.isHidden).length;
    const rare = selectedGame.achievements.filter((a) => a.rarity && a.rarity < 10).length;
    const completionPercentage = (unlocked / total) * 100;

    return { total, unlocked, hidden, rare, completionPercentage };
  }, [selectedGame?.achievements]);

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
        // View mode filter
        if (viewMode === "unlocked" && !achievement.isUnlocked) return false;
        if (viewMode === "locked" && achievement.isUnlocked) return false;

        // Legacy filters for backwards compatibility
        if (hideUnlocked && achievement.isUnlocked) return false;
        if (hideHidden && achievement.isHidden) return false;

        // Search filter
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

  if (loading || !selectedGame) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!achievementStats) return null;

  const activeFiltersCount = (hideUnlocked ? 1 : 0) + (hideHidden ? 1 : 0) + (viewMode !== "all" ? 1 : 0);

  return (
    <div className="mx-auto w-full space-y-6 py-4">
      {/* Overview Stats Card */}
      <Card title="Overview">
        <div className="space-y-6">
          {/* Main Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Overall Progress
              </h3>
              <span className="text-2xl font-bold text-primary">
                {achievementStats.completionPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={achievementStats.completionPercentage} className="h-3" />
            <div className="text-sm text-design-text-subtle">
              {achievementStats.unlocked} of {achievementStats.total} achievements unlocked
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-design-foreground p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-xl font-bold text-design-text-normal">{achievementStats.unlocked}</div>
              <div className="text-xs text-design-text-subtle">Unlocked</div>
            </div>
            <div className="rounded-lg bg-design-foreground p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Lock className="h-5 w-5 text-design-text-subtle" />
              </div>
              <div className="text-xl font-bold text-design-text-normal">
                {achievementStats.total - achievementStats.unlocked}
              </div>
              <div className="text-xs text-design-text-subtle">Remaining</div>
            </div>
            <div className="rounded-lg bg-design-foreground p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-design-text-normal">{achievementStats.rare}</div>
              <div className="text-xs text-design-text-subtle">Rare (&lt;10%)</div>
            </div>
            <div className="rounded-lg bg-design-foreground p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-design-text-subtle" />
              </div>
              <div className="text-xl font-bold text-design-text-normal">{achievementStats.hidden}</div>
              <div className="text-xs text-design-text-subtle">Hidden</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievement Highlights */}
      {achievementStats.unlocked > 0 && (
        <Card title="Highlights">
          <AchievementHighlights achievements={selectedGame.achievements} achievementLogos={achievementLogos} />
        </Card>
      )}

      {achievementStats.unlocked > 0 && (
        <Card title="Timeline">
          <AchievementTimeline />
        </Card>
      )}

      {/* All Achievements Card */}
      <Card title="All Achievements">
        <div className="space-y-6">
          {/* View Mode Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode("all")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-primary text-white"
                  : "bg-design-foreground text-design-text-normal hover:bg-design-background"
              }`}
            >
              All ({achievementStats.total})
            </button>
            <button
              onClick={() => setViewMode("unlocked")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "unlocked"
                  ? "bg-primary text-white"
                  : "bg-design-foreground text-design-text-normal hover:bg-design-background"
              }`}
            >
              <CheckCircle className="mr-1 inline h-4 w-4" />
              Unlocked ({achievementStats.unlocked})
            </button>
            <button
              onClick={() => setViewMode("locked")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "locked"
                  ? "bg-primary text-white"
                  : "bg-design-foreground text-design-text-normal hover:bg-design-background"
              }`}
            >
              <Lock className="mr-1 inline h-4 w-4" />
              Locked ({achievementStats.total - achievementStats.unlocked})
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative max-w-md flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-design-text-subtle" />
              <Input
                color="dark"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Recent First</span>
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Alphabetical</span>
                  </div>
                </SelectItem>
                <SelectItem value="rarity">
                  <div className="flex items-center gap-2">
                    <Medal className="h-4 w-4" />
                    <span>Rarity</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-md border border-design-border px-3 py-2 text-sm hover:bg-design-background"
            >
              <Filter className="h-4 w-4" />
              Advanced
              {activeFiltersCount > 0 && <Badge className="ml-1 bg-primary text-xs">{activeFiltersCount}</Badge>}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="rounded-md border border-design-border bg-design-foreground p-4">
              <h4 className="mb-3 text-sm font-medium">Advanced Filters</h4>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox checked={hideUnlocked} onCheckedChange={(checked) => setHideUnlocked(checked === true)} />
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Hide Unlocked
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox checked={hideHidden} onCheckedChange={(checked) => setHideHidden(checked === true)} />
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-4 w-4" />
                    Hide Hidden
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-design-text-subtle">
            <span>Showing {filteredAchievements.length} achievements</span>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">
                Clear search
              </button>
            )}
          </div>

          {/* No Results */}
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
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Achievement List */}
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
                  {/* Achievement Icon */}
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

                  {/* Achievement Info - Main Content */}
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

                  {/* Achievement Status - Right Side */}
                  <div className="flex flex-shrink-0 flex-col items-end space-y-1 text-right">
                    {achievement.isUnlocked ? (
                      <>
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span className="font-medium">Unlocked</span>
                        </div>
                        <div className="text-xs text-design-text-subtle">
                          {unixToDate(Number(achievement.unlockedAt))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-medium text-design-text-subtle">Locked</div>
                    )}

                    {achievement.rarity && (
                      <div className="text-xs text-design-text-subtle">{achievement.rarity.toFixed(1)}% unlocked</div>
                    )}
                  </div>
                </div>

                {/* Unlocked Achievement Accent */}
                {achievement.isUnlocked && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-design-achievement-unlocked-underline" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SectionAchievements;
