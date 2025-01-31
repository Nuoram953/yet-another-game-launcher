import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGames } from "@/context/DatabaseContext";
import { Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";

export const SectionAchievements = () => {
  const [metadata, setMetadata] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const ressources = await window.ressource.getAll(selectedGame.id);
        console.log(ressources);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchBackgroundPicture();
  }, []);
  const graphData = [
    { date: "2024-01-01", total: 5 },
    { date: "2024-01-15", total: 8 },
    { date: "2024-01-30", total: 12 },
    { date: "2024-02-15", total: 15 },
    { date: "2024-02-28", total: 20 },
  ];

  const recentAchievements = [
    {
      id: 1,
      name: "Master Explorer",
      description: "Discover all secret areas",
      unlockedAt: "2024-02-28",
      rarity: "Rare",
    },
    {
      id: 2,
      name: "Speed Demon",
      description: "Complete level 10 under 2 minutes",
      unlockedAt: "2024-02-25",
      rarity: "Epic",
    },
    {
      id: 3,
      name: "Collector",
      description: "Find 100 hidden items",
      unlockedAt: "2024-02-20",
      rarity: "Common",
    },
  ];

  const allAchievements = [
    ...recentAchievements,
    {
      id: 4,
      name: "First Steps",
      description: "Complete the tutorial",
      unlockedAt: "2024-01-01",
      rarity: "Common",
    },
    {
      id: 5,
      name: "Warrior",
      description: "Win 50 battles",
      unlockedAt: "2024-01-15",
      rarity: "Uncommon",
    },
  ];

  const getRarityColor = (rarity) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "text-gray-500";
      case "uncommon":
        return "text-green-500";
      case "rare":
        return "text-blue-500";
      case "epic":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      {/* Progress Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">chart</div>
        </CardContent>
      </Card>

      {/* Recently Unlocked */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Unlocked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4"
              >
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">
                    {achievement.name}
                    <span
                      className={`ml-2 text-sm ${getRarityColor(achievement.rarity)}`}
                    >
                      {achievement.rarity}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Unlocked: {achievement.unlockedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {selectedGame.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-4 border-b p-4 last:border-b-0"
              >
                <Trophy className="h-5 w-5 text-gray-400" />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{achievement.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
