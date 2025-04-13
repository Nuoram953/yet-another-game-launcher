import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGames } from "@/context/DatabaseContext";
import { CheckCircle, EyeOff, Lock, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Tile } from "./Tile";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
export const SectionAchievements = () => {
  const [achievementLogos, setAchievementLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideHidden, setHideHidden] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const ressources = await window.media.getAchievements(selectedGame!.id);
        console.log(ressources);
        setAchievementLogos(ressources);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchBackgroundPicture();
  }, []);

  const sortAchievements = (a: GameAchievement, b: GameAchievement) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        if (a.isUnlocked && b.isUnlocked) {
          return (
            new Date(Number(b.unlockedAt)) - new Date(Number(a.unlockedAt))
          );
        }
        return b.isUnlocked - a.isUnlocked;
      default:
        return 0;
    }
  };

  if (loading || !selectedGame) {
    return <div>Loading...</div>;
  }

  const totalAchievements = selectedGame.achievements.length;
  const unlockedAchievements = selectedGame.achievements.filter(
    (a) => a.isUnlocked,
  ).length;
  const completionPercentage = (unlockedAchievements / totalAchievements) * 100;

  const filteredAchievements = selectedGame.achievements
    .filter((achievement) => {
      if (hideUnlocked && achievement.isUnlocked) return false;
      if (hideHidden && achievement.isHidden) return false;
      return true;
    })
    .sort(sortAchievements);

  return (
    <div className="mx-auto w-full space-y-4 py-4">
      {selectedGame?.achievements.filter(item=>item.isUnlocked).length > 0 && (
        <Tile>
          <CardHeader>
            <CardTitle>Achievement History</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementTimeline />
          </CardContent>
        </Tile>
      )}

      <Tile>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Achievements</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={hideUnlocked}
                    onCheckedChange={setHideUnlocked}
                  />
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Hide Unlocked
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={hideHidden}
                    onCheckedChange={setHideHidden}
                  />
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-4 w-4" />
                    Hide Hidden
                  </span>
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="date">Sort by Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Overall Progress</span>
                <span className="font-medium text-gray-300">
                  {unlockedAchievements} of {totalAchievements} (
                  {completionPercentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={completionPercentage} className="h-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={`all-${achievement.id}`}
                className="flex items-center space-x-4 border-b border-gray-700 p-4 last:border-b-0"
              >
                {achievement.isUnlocked ? (
                  <img
                    src={achievementLogos.find((logo) =>
                      logo.includes(`achievement/${achievement.externalId}.`),
                    )}
                    alt={`game name logo`}
                    className="h-20 w-20 transform rounded-sm object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-gray-600">
                    <Lock />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{achievement.name}</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    {achievement.description}
                  </p>
                  {achievement.isUnlocked && (
                    <p className="mt-1 text-xs text-gray-500">
                      Unlocked: {unixToDate(achievement.unlockedAt)}
                    </p>
                  )}
                </div>
                <br />
              </div>
            ))}
          </div>
        </CardContent>
      </Tile>
    </div>
  );
};
