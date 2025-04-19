import { Card } from "@/components/card/Card";
import { useGames } from "@/context/DatabaseContext";
import { Award, Trophy, RefreshCcw } from "lucide-react";
import React from "react";
import { useNotifications } from "@/components/NotificationSystem";

export const ProgressTracker = () => {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const totalPlaytime = (selectedGame?.timePlayed || 0) * 60;

  if (!selectedGame) {
    return;
  }

  const formatTime = (seconds: number) => {
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

  const getProgressData = (goalTime: number) => {
    const percent = Math.min(100, (totalPlaytime / goalTime) * 100);
    const remaining = Math.max(0, goalTime - totalPlaytime);
    return { percent, remaining };
  };

  const mainStoryData = getProgressData(selectedGame?.mainStory!);
  const extrasData = getProgressData(selectedGame?.mainPlusExtra!);
  const completionistData = getProgressData(selectedGame?.completionist!);

  const getTimelinePosition = (timeValue) => {
    const position = (timeValue / selectedGame?.completionist!) * 100;
    return `${Math.min(Math.max(position, 0), 100)}%`;
  };

  // Determine the current section based on playtime
  const getCurrentSection = () => {
    if (totalPlaytime <= selectedGame.mainStory!) {
      return {
        color: "from-blue-600 to-blue-400",
        percent: (totalPlaytime / selectedGame.mainStory!) * 100
      };
    } else if (totalPlaytime <= selectedGame.mainPlusExtra!) {
      return {
        color: "from-purple-600 to-purple-400",
        percent: (totalPlaytime / selectedGame.mainPlusExtra!) * 100
      };
    } else {
      return {
        color: "from-amber-600 to-amber-400",
        percent: (totalPlaytime / selectedGame.completionist!) * 100
      };
    }
  };

  const currentSection = getCurrentSection();

  return (
    <Card
      title="Progress Tracker"
      actions={[
        {
          icon: RefreshCcw,
          name: "Refresh",
          onClick: async () => {
            await window.game.refreshProgressTracker(selectedGame.id!);
            addNotification({
              title: "Progress Tracker",
              message: "Progress Tracker refreshed successfully.",
              type: "success",
              duration: 2000,
            });
          },
        },
      ]}
    >
      <div className="relative mb-8 h-20">
        {/* Timeline base - thicker and with segments */}
        <div className="absolute left-0 right-0 top-4 h-3 rounded-full bg-white/10">
          {/* Main story section */}
          <div 
            className="absolute h-full rounded-l-full bg-gradient-to-r from-blue-600/30 to-blue-400/30" 
            style={{ 
              width: `${(selectedGame.mainStory! / selectedGame.completionist!) * 100}%`,
              zIndex: 1
            }}
          ></div>
          
          {/* Main+Extras section */}
          <div 
            className="absolute h-full bg-gradient-to-r from-purple-600/30 to-purple-400/30" 
            style={{ 
              left: `${(selectedGame.mainStory! / selectedGame.completionist!) * 100}%`,
              width: `${((selectedGame.mainPlusExtra! - selectedGame.mainStory!) / selectedGame.completionist!) * 100}%`,
              zIndex: 1
            }}
          ></div>
          
          {/* Completionist section */}
          <div 
            className="absolute h-full rounded-r-full bg-gradient-to-r from-amber-600/30 to-amber-400/30" 
            style={{ 
              left: `${(selectedGame.mainPlusExtra! / selectedGame.completionist!) * 100}%`,
              right: 0,
              zIndex: 1
            }}
          ></div>
          
          {/* Progress indicator - uses current section color */}
          <div 
            className={`absolute h-full rounded-l-full bg-gradient-to-r ${currentSection.color}`} 
            style={{ 
              width: getTimelinePosition(totalPlaytime),
              zIndex: 2
            }}
          ></div>
        </div>

        {/* Your position indicator */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{
            left: getTimelinePosition(totalPlaytime),
            zIndex: 20,
          }}
        >
          <div className="z-10 h-4 w-4 rounded-full bg-white shadow-lg shadow-indigo-500/50"></div>
          <div className="my-1 h-8 w-px bg-white/30"></div>
          <div className="whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-3 py-1 text-xs text-white shadow-lg">
            You: {formatTime(selectedGame?.timePlayed * 60)}
          </div>
        </div>

        {/* Main Story marker */}
        <div
          className="absolute top-4 -translate-y-1/2"
          style={{
            left: `${(selectedGame.mainStory! / selectedGame.completionist!) * 100}%`,
          }}
        >
          <div className="h-6 w-px bg-blue-400/50"></div>
          <div className="absolute top-10 -translate-x-1/2 whitespace-nowrap text-xs text-blue-400">
            Main: {formatTime(selectedGame.mainStory!)}
          </div>
        </div>

        {/* Main + Extras marker */}
        <div
          className="absolute top-4 -translate-y-1/2"
          style={{
            left: `${(selectedGame.mainPlusExtra! / selectedGame.completionist!) * 100}%`,
          }}
        >
          <div className="h-6 w-px bg-purple-400/50"></div>
          <div className="absolute top-10 -translate-x-1/2 whitespace-nowrap text-xs text-purple-400">
            Extras: {formatTime(selectedGame.mainPlusExtra!)}
          </div>
        </div>

        {/* Completionist marker */}
        <div
          className="absolute top-4 -translate-y-1/2"
          style={{ left: `100%` }}
        >
          <div className="h-6 w-px bg-amber-400/50"></div>
          <div className="absolute top-10 -translate-x-1/2 whitespace-nowrap text-xs text-amber-400">
            100%: {formatTime(selectedGame.completionist!)}
          </div>
        </div>
      </div>

      {/* Progress cards with glassmorphism */}
      <div className="grid gap-4">
        {/* Main Story */}
        <div className="rounded-xl p-4 backdrop-blur-sm transition-colors">
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 p-2">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Main Story</h4>
                <div className="text-xs text-white/60">
                  {formatTime(selectedGame.mainStory!)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {Math.round(mainStoryData.percent)}%
              </div>
              <div className="text-xs text-white/60">
                {mainStoryData.remaining > 0
                  ? `${formatTime(mainStoryData.remaining)} left`
                  : "Completed"}
              </div>
            </div>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${mainStoryData.percent}%` }}
            ></div>
          </div>
        </div>

        {/* Main + Extras */}
        <div className="rounded-xl p-4 backdrop-blur-sm transition-colors">
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 p-2">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Main + Extras</h4>
                <div className="text-xs text-white/60">
                  {formatTime(selectedGame.mainPlusExtra!)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {Math.round(extrasData.percent)}%
              </div>
              <div className="text-xs text-white/60">
                {extrasData.remaining > 0
                  ? `${formatTime(extrasData.remaining)} left`
                  : "Completed"}
              </div>
            </div>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
              style={{ width: `${extrasData.percent}%` }}
            ></div>
          </div>
        </div>

        {/* Completionist */}
        <div className="rounded-xl p-4 backdrop-blur-sm transition-colors">
          <div className="mb-3 flex justify-between">
            <div className="flex items-center">
              <div className="mr-3 rounded-lg bg-gradient-to-br from-amber-600 to-amber-400 p-2">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Completionist</h4>
                <div className="text-xs text-white/60">
                  {formatTime(selectedGame.completionist!)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {Math.round(completionistData.percent)}%
              </div>
              <div className="text-xs text-white/60">
                {completionistData.remaining > 0
                  ? `${formatTime(completionistData.remaining)} left`
                  : "Completed"}
              </div>
            </div>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              style={{ width: `${completionistData.percent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};
