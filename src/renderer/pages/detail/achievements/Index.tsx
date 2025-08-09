import { useGames } from "@render//context/DatabaseContext";
import React, { useEffect, useState, useMemo } from "react";
import AchievementTimeline from "./AchievementTimeline";
import { Card } from "@render//components/card/Card";
import { getMedia } from "@render/api/electron";
import { AchievementHighlights } from "./Hightlights";
import { AchievementOverview } from "./Overview";
import { AchievementAll } from "./AllAchievements";

export const SectionAchievements = () => {
  const [achievementLogos, setAchievementLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedGame } = useGames();

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

  const achievementStats = useMemo(() => {
    if (!selectedGame?.achievements) return null;

    const total = selectedGame.achievements.length;
    const unlocked = selectedGame.achievements.filter((a) => a.isUnlocked).length;
    const hidden = selectedGame.achievements.filter((a) => a.isHidden).length;
    const rare = selectedGame.achievements.filter((a) => a.rarity && a.rarity < 10).length;
    const completionPercentage = (unlocked / total) * 100;

    return { total, unlocked, hidden, rare, completionPercentage };
  }, [selectedGame?.achievements]);

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

  return (
    <div className="mx-auto w-full space-y-6 py-4">
      <AchievementOverview achievementStats={achievementStats} />

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

      <Card title="All Achievements">
        <AchievementAll />
      </Card>
    </div>
  );
};

export default SectionAchievements;
