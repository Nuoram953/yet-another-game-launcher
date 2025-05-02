import { useGames } from "@/context/DatabaseContext";
import { CheckCircle, EyeOff, Lock, Medal, Filter, Search, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { unixToDate } from "@/utils/util";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameAchievement } from "@prisma/client";
import AchievementTimeline from "./AchievementTimeline";
import { Card } from "@/components/card/Card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/input/Input";

export const SectionAchievements = () => {
  const [achievementLogos, setAchievementLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const resources = await window.media.getAchievements(selectedGame?.id);
        setAchievementLogos(resources);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievement images:", error);
      }
    };

    if (selectedGame?.id) {
      fetchBackgroundPicture();
    }
  }, [selectedGame?.id]);

  const sortAchievements = (a, b) => {
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
        // Assuming lower percentage means rarer achievement
        return (a.globalUnlockPercentage || 100) - (b.globalUnlockPercentage || 100);
      default:
        return 0;
    }
  };

  if (loading || !selectedGame) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  const totalAchievements = selectedGame.achievements.length;
  const unlockedAchievements = selectedGame.achievements.filter(a => a.isUnlocked).length;
  const completionPercentage = (unlockedAchievements / totalAchievements) * 100;

  const filteredAchievements = selectedGame.achievements
    .filter(achievement => {
      if (hideUnlocked && achievement.isUnlocked) return false;
      if (hideHidden && achievement.isHidden) return false;
      if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !achievement.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort(sortAchievements);

  return (
    <div className="mx-auto w-full space-y-6 py-4">
      {selectedGame?.achievements.filter(item => item.isUnlocked).length > 0 && (
        <Card title="Achievement History">
          <AchievementTimeline />
        </Card>
      )}

      <Card title="All Achievements">
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Overall Progress</span>
              <span className="font-medium text-gray-300">
                {unlockedAchievements} of {totalAchievements} ({completionPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={completionPercentage} className="h-6" />
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  color={"dark"}
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
              >
                <Filter className="h-4 w-4" />
                Filters
                <Badge className="ml-1 bg-primary text-xs">
                  {(hideUnlocked ? 1 : 0) + (hideHidden ? 1 : 0)}
                </Badge>
              </button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="date">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Date</span>
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
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-6 rounded-md bg-gray-800/50 p-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={hideUnlocked}
                    onCheckedChange={(checked) => setHideUnlocked(checked === true)}
                  />
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Hide Unlocked
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={hideHidden}
                    onCheckedChange={(checked) => setHideHidden(checked === true)}
                  />
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-4 w-4" />
                    Hide Hidden
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* No results message */}
          {filteredAchievements.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <div className="mb-2 rounded-full bg-gray-800 p-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No achievements found</h3>
              <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
            </div>
          )}

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => (
              <div
                key={`all-${achievement.id}`}
                className={`relative overflow-hidden rounded-lg border ${
                  achievement.isUnlocked 
                    ? "border-green-700 bg-green-900/10" 
                    : "border-gray-700 bg-gray-800/50"
                } transition-all duration-300 hover:border-primary`}
              >
                <div className="flex p-4">
                  <div className="mr-4">
                    {achievement.isUnlocked ? (
                      <img
                        src={achievementLogos.find((logo) =>
                          logo.includes(`achievement/${achievement.externalId}.`)
                        )}
                        alt={achievement.name}
                        className="h-16 w-16 rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-700">
                        <Lock className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold leading-tight">{achievement.name}</h3>
                      {achievement.isHidden && (
                        <EyeOff className="ml-1 h-4 w-4 text-gray-400" title="Hidden Achievement" />
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{achievement.description}</p>
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="flex items-center text-xs text-green-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        <span>Unlocked: {unixToDate(Number(achievement.unlockedAt))}</span>
                      </div>
                    )}
                  </div>
                </div>
                {achievement.isUnlocked && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500" />
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
