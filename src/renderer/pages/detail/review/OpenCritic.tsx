import { Card } from "@/components/card/Card";
import { useGames } from "@/context/DatabaseContext";
import { Award, ThumbsUp, Users, Star, RefreshCcw, BarChart3 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNotifications } from "@/components/NotificationSystem";

export default function OpenCriticReviews() {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Sample OpenCritic data (in a real implementation, this would come from an API)
  const [reviewData, setReviewData] = useState(null);
  
  useEffect(() => {
    // Animation effect when game changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    
    // Simulate loading data when game changes
    if (selectedGame) {
      // This would be replaced with actual API call to OpenCritic
      setTimeout(() => {
        setReviewData({
          topCriticScore: 87,
          averageScore: 83,
          recommendPercent: 92,
          totalReviews: 124,
          tierRank: "Mighty",
          tierColor: "from-amber-600 to-amber-400",
          reviewHighlights: [
            { 
              publication: "IGN",
              score: 90,
              quote: "An exceptional experience that showcases the best of what gaming has to offer."
            },
            {
              publication: "GameSpot",
              score: 85,
              quote: "Impressive depth with rewarding gameplay systems that constantly evolve."
            },
            {
              publication: "PC Gamer",
              score: 88,
              quote: "Technical excellence meets creative design in this standout title."
            }
          ]
        });
      }, 600);
    } else {
      setReviewData(null);
    }
    
    return () => clearTimeout(timer);
  }, [selectedGame?.id]);

  if (!selectedGame) {
    return (
      <Card title="OpenCritic Reviews">
        <div className="flex h-64 items-center justify-center text-white/60">
          <p>Select a game to view critic reviews</p>
        </div>
      </Card>
    );
  }

  if (!reviewData) {
    return (
      <Card title="OpenCritic Reviews">
        <div className="flex h-64 items-center justify-center text-white/60">
          <div className="flex flex-col items-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p>Loading review data...</p>
          </div>
        </div>
      </Card>
    );
  }

  const getTierColor = (tierRank) => {
    const tierColors = {
      "Mighty": "from-amber-600 to-amber-400",
      "Strong": "from-emerald-600 to-emerald-400",
      "Fair": "from-blue-600 to-blue-400",
      "Weak": "from-orange-600 to-orange-400",
      "Poor": "from-red-600 to-red-400"
    };
    
    return tierColors[tierRank] || "from-gray-600 to-gray-400";
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-amber-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };
  
  const getScoreBarColor = (score) => {
    if (score >= 90) return "from-emerald-600 to-emerald-400";
    if (score >= 80) return "from-amber-600 to-amber-400";
    if (score >= 70) return "from-blue-600 to-blue-400";
    if (score >= 60) return "from-orange-600 to-orange-400";
    return "from-red-600 to-red-400";
  };

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          <span>OpenCritic Reviews - {selectedGame.name}</span>
        </div>
      }
      actions={[
        {
          icon: RefreshCcw,
          name: "Refresh",
          onClick: async () => {
            setIsAnimating(true);
            // This would be replaced with actual refresh logic
            setTimeout(() => {
              setIsAnimating(false);
              addNotification({
                title: "OpenCritic Reviews",
                message: "Review data refreshed successfully.",
                type: "success",
                duration: 2000,
              });
            }, 800);
          },
        },
      ]}
      className="overflow-hidden"
    >
      {/* Main review score section */}
      <div className="relative mb-6">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          {/* Tier Rating */}
          <div 
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900/30 to-indigo-800/10 p-6 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "scale-105" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div className={`mb-2 rounded-full bg-gradient-to-r ${getTierColor(reviewData.tierRank)} p-3`}>
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{reviewData.tierRank}</h3>
              <p className="text-sm text-white/70">OpenCritic Tier</p>
            </div>
          </div>
          
          {/* Top Critic Score */}
          <div 
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-6 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "scale-105" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{reviewData.topCriticScore}</h3>
              <p className="text-sm text-white/70">Top Critic Score</p>
            </div>
          </div>
          
          {/* Recommend % */}
          <div 
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/10 p-6 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "scale-105" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 rounded-full bg-gradient-to-r from-green-600 to-green-400 p-3">
                <ThumbsUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{reviewData.recommendPercent}%</h3>
              <p className="text-sm text-white/70">Critics Recommend</p>
            </div>
          </div>
          
          {/* Total Reviews */}
          <div 
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-6 backdrop-blur-sm transition-all duration-500 ${isAnimating ? "scale-105" : ""}`}
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{reviewData.totalReviews}</h3>
              <p className="text-sm text-white/70">Total Reviews</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Score distribution */}
      <div className="mb-6 rounded-xl bg-indigo-900/20 p-4 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-medium text-white">Score Distribution</h3>
        
        <div className="space-y-4">
          {/* Score ranges */}
          {[
            { range: "90-100", percent: 45, color: "from-emerald-600 to-emerald-400" },
            { range: "80-89", percent: 32, color: "from-amber-600 to-amber-400" },
            { range: "70-79", percent: 18, color: "from-blue-600 to-blue-400" },
            { range: "60-69", percent: 5, color: "from-orange-600 to-orange-400" },
            { range: "0-59", percent: 0, color: "from-red-600 to-red-400" }
          ].map(score => (
            <div key={score.range} className="flex items-center">
              <div className="w-16 text-sm text-white/70">{score.range}</div>
              <div className="flex-1">
                <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className={`absolute h-full rounded-full bg-gradient-to-r ${score.color} transition-all duration-700 ease-out ${isAnimating ? "opacity-80" : ""}`}
                    style={{ width: `${score.percent}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-2 w-10 text-right text-sm text-white/70">
                {score.percent}%
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Review highlights */}
      <div className="rounded-xl bg-indigo-900/20 p-4 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-medium text-white">Review Highlights</h3>
        
        <div className="space-y-4">
          {reviewData.reviewHighlights.map((review, index) => (
            <div 
              key={index}
              className={`relative overflow-hidden rounded-lg bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 ${isAnimating ? "translate-y-1" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium text-white">{review.publication}</h4>
                <div className={`rounded-md bg-white/10 px-2 py-1 text-sm font-bold ${getScoreColor(review.score)}`}>
                  {review.score}
                </div>
              </div>
              <p className="text-sm italic text-white/70">"{review.quote}"</p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor(review.score)}`}
                  style={{ width: `${review.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center">
          <button className="rounded-md bg-indigo-600/60 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600/80">
            View All Reviews
          </button>
        </div>
      </div>
    </Card>
  );
}
