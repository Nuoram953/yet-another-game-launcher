import { Card } from "@/components/card/Card";
import { useGames } from "@/context/DatabaseContext";
import { Award, Trophy, RefreshCcw, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNotifications } from "@/components/NotificationSystem";

export const ProgressTracker = () => {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [isAnimating, setIsAnimating] = useState(false);
  const totalPlaytime = (selectedGame?.timePlayed || 0) * 60;

  useEffect(() => {
    // Animation effect when game changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [selectedGame?.id]);

  if (!selectedGame) {
    return (
      <Card title="Progress Tracker">
        <div className="flex h-64 items-center justify-center text-white/60">
          <p>Select a game to track progress</p>
        </div>
      </Card>
    );
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getProgressData = (goalTime) => {
    const percent = Math.min(100, (totalPlaytime / goalTime) * 100);
    const remaining = Math.max(0, goalTime - totalPlaytime);
    return { percent, remaining };
  };

  const mainStoryData = getProgressData(selectedGame?.mainStory);
  const extrasData = getProgressData(selectedGame?.mainPlusExtra);
  const completionistData = getProgressData(selectedGame?.completionist);

  const getTimelinePosition = (timeValue) => {
    const position = (timeValue / selectedGame?.completionist) * 100;
    return `${Math.min(Math.max(position, 0), 100)}%`;
  };

  // Determine the current section based on playtime
  const getCurrentSection = () => {
    if (totalPlaytime <= selectedGame.mainStory) {
      return {
        color: "from-blue-600 to-blue-400",
        percent: (totalPlaytime / selectedGame.mainStory) * 100,
      };
    } else if (totalPlaytime <= selectedGame.mainPlusExtra) {
      return {
        color: "from-purple-600 to-purple-400",
        percent: (totalPlaytime / selectedGame.mainPlusExtra) * 100,
      };
    } else {
      return {
        color: "from-amber-600 to-amber-400",
        percent: (totalPlaytime / selectedGame.completionist) * 100,
      };
    }
  };

  const currentSection = getCurrentSection();

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-indigo-400" />
          <span>Progress Tracker - {selectedGame.name}</span>
        </div>
      }
      actions={[
        {
          icon: RefreshCcw,
          name: "Refresh",
          onClick: async () => {
            setIsAnimating(true);
            await window.game.refreshProgressTracker(selectedGame.id);
            addNotification({
              title: "Progress Tracker",
              message: "Progress Tracker refreshed successfully.",
              type: "success",
              duration: 2000,
            });
            setTimeout(() => setIsAnimating(false), 800);
          },
        },
      ]}
      className="overflow-hidden"
    >
      <div className="relative mb-12 h-24 pt-2">
        {/* Timeline base - thicker and with segments */}
        <div className="absolute left-0 right-0 top-6 h-4 rounded-full bg-white/10 shadow-inner">
          {/* Main story section */}
          <div
            className="absolute h-full rounded-l-full bg-gradient-to-r from-blue-600/30 to-blue-400/30"
            style={{
              width: `${(selectedGame.mainStory / selectedGame.completionist) * 100}%`,
              zIndex: 1,
            }}
          ></div>

          {/* Main+Extras section */}
          <div
            className="absolute h-full bg-gradient-to-r from-purple-600/30 to-purple-400/30"
            style={{
              left: `${(selectedGame.mainStory / selectedGame.completionist) * 100}%`,
              width: `${((selectedGame.mainPlusExtra - selectedGame.mainStory) / selectedGame.completionist) * 100}%`,
              zIndex: 1,
            }}
          ></div>

          {/* Completionist section */}
          <div
            className="absolute h-full rounded-r-full bg-gradient-to-r from-amber-600/30 to-amber-400/30"
            style={{
              left: `${(selectedGame.mainPlusExtra / selectedGame.completionist) * 100}%`,
              right: 0,
              zIndex: 1,
            }}
          ></div>

          {/* Progress indicator with pulse animation when refreshing */}
          <div
            className={`absolute h-full rounded-l-full bg-gradient-to-r ${currentSection.color} transition-all duration-700 ease-out ${isAnimating ? "animate-pulse" : ""}`}
            style={{
              width: getTimelinePosition(totalPlaytime),
              zIndex: 2,
            }}
          ></div>
        </div>

        {/* Your position indicator */}
        <div
          className={`absolute top-0 flex flex-col items-center transition-all duration-700 ease-out ${isAnimating ? "scale-110" : "scale-100"}`}
          style={{
            left: getTimelinePosition(totalPlaytime),
            transform: `translateX(-50%)`,
            zIndex: 20,
          }}
        >
          <div className="z-10 h-6 w-6 rounded-full bg-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 ring-offset-2 ring-offset-indigo-800"></div>
          <div className="my-1 h-8 w-px bg-white/50"></div>
          <div className="whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 px-4 py-1 text-sm font-medium text-white shadow-lg">
            Your Time: {formatTime(totalPlaytime)}
          </div>
        </div>

        {/* Main Story marker */}
        <div
          className="absolute top-6 -translate-y-1/2"
          style={{
            left: `${(selectedGame.mainStory / selectedGame.completionist) * 100}%`,
          }}
        >
          <div className="h-8 w-px bg-blue-400/70"></div>
          <div className="absolute left-0 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-blue-900/40 px-2 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm">
            Main Story: {formatTime(selectedGame.mainStory)}
          </div>
        </div>

        {/* Main + Extras marker */}
        <div
          className="absolute top-6 -translate-y-1/2"
          style={{
            left: `${(selectedGame.mainPlusExtra / selectedGame.completionist) * 100}%`,
          }}
        >
          <div className="h-8 w-px bg-purple-400/70"></div>
          <div className="absolute left-0 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-purple-900/40 px-2 py-1 text-xs font-medium text-purple-300 backdrop-blur-sm">
            With Extras: {formatTime(selectedGame.mainPlusExtra)}
          </div>
        </div>

        {/* Completionist marker */}
        <div
          className="absolute top-6 -translate-y-1/2"
          style={{ left: `100%` }}
        >
          <div className="h-8 w-px bg-amber-400/70"></div>
          <div className="absolute right-0 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-amber-900/40 px-2 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
            Completionist: {formatTime(selectedGame.completionist)}
          </div>
        </div>
      </div>

      {/* Progress cards with improved glassmorphism */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Story */}
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-4 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "translate-y-1" : ""}`}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 p-2 shadow-lg shadow-blue-500/20">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-100">Main Story</h4>
                <div className="text-xs text-blue-300/80">
                  {formatTime(selectedGame.mainStory)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-100">
                {Math.round(mainStoryData.percent)}%
              </div>
              <div className="text-xs text-blue-300/80">
                {mainStoryData.remaining > 0
                  ? `${formatTime(mainStoryData.remaining)} left`
                  : "Completed ✓"}
              </div>
            </div>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className={`absolute h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out ${isAnimating ? "opacity-80" : ""}`}
              style={{ width: `${mainStoryData.percent}%` }}
            >
              {mainStoryData.percent > 98 && (
                <div className="absolute inset-0 bg-white/20"></div>
              )}
            </div>
          </div>
        </div>

        {/* Main + Extras */}
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "translate-y-1" : ""}`}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl"></div>
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 p-2 shadow-lg shadow-purple-500/20">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-purple-100">Main + Extras</h4>
                <div className="text-xs text-purple-300/80">
                  {formatTime(selectedGame.mainPlusExtra)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-100">
                {Math.round(extrasData.percent)}%
              </div>
              <div className="text-xs text-purple-300/80">
                {extrasData.remaining > 0
                  ? `${formatTime(extrasData.remaining)} left`
                  : "Completed ✓"}
              </div>
            </div>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className={`absolute h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700 ease-out ${isAnimating ? "opacity-80" : ""}`}
              style={{ width: `${extrasData.percent}%` }}
            >
              {extrasData.percent > 98 && (
                <div className="absolute inset-0 bg-white/20"></div>
              )}
            </div>
          </div>
        </div>

        {/* Completionist */}
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/10 p-4 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "translate-y-1" : ""}`}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl"></div>
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-amber-600 to-amber-400 p-2 shadow-lg shadow-amber-500/20">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-amber-100">Completionist</h4>
                <div className="text-xs text-amber-300/80">
                  {formatTime(selectedGame.completionist)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-100">
                {Math.round(completionistData.percent)}%
              </div>
              <div className="text-xs text-amber-300/80">
                {completionistData.remaining > 0
                  ? `${formatTime(completionistData.remaining)} left`
                  : "Completed ✓"}
              </div>
            </div>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-white/10 shadow-inner">
            <div
              className={`absolute h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700 ease-out ${isAnimating ? "opacity-80" : ""}`}
              style={{ width: `${completionistData.percent}%` }}
            >
              {completionistData.percent > 98 && (
                <div className="absolute inset-0 bg-white/20"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overall completion status - new feature */}
      <div className="mt-6 rounded-lg bg-indigo-900/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 p-2">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-indigo-100">
                Overall Completion
              </h4>
              <div className="text-xs text-indigo-300/80">
                {formatTime(totalPlaytime)} of{" "}
                {formatTime(selectedGame.completionist)} total
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-indigo-100">
              {Math.round(completionistData.percent)}% Complete
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
