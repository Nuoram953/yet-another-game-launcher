import React, { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tile } from "./Tile";
import { GameReview } from "@prisma/client";
import { useGames } from "@/context/DatabaseContext";

export const SectionReview = () => {
  return (<div></div>)
  // const { selectedGame } = useGames();
  // const [isAdvanced, setIsAdvanced] = useState(
  //   selectedGame?.review?.isAdvanceReview ?? false,
  // );
  // const [review, setReview] = useState(selectedGame?.review?.review);
  // const [submitted, setSubmitted] = useState(false);
  //
  // // Basic score
  // const [overallScore, setOverallScore] = useState(selectedGame?.review?.score);
  // const [overallHover, setOverallHover] = useState(0);
  //
  // // Advanced scores
  // const [advancedScores, setAdvancedScores] = useState({
  //   graphics: { score: selectedGame?.review?.scoreGraphic, hover: 0 },
  //   gameplay: { score: selectedGame?.review?.scoreGameplay, hover: 0 },
  //   story: { score: selectedGame?.review?.scoreStory, hover: 0 },
  //   sound: { score: selectedGame?.review?.scoreSound, hover: 0 },
  //   content: { score: selectedGame?.review?.scoreContent, hover: 0 },
  // });
  //
  // const updateAdvancedScore = (category, value, isHover = false) => {
  //   setAdvancedScores((prev) => ({
  //     ...prev,
  //     [category]: {
  //       ...prev[category],
  //       [isHover ? "hover" : "score"]: value,
  //     },
  //   }));
  // };
  //
  // const calculateOverallScore = () => {
  //   if (!isAdvanced) return overallScore;
  //   const scores = Object.values(advancedScores).map((s) => s.score);
  //   return scores.reduce((a, b) => a + b, 0) / scores.length;
  // };
  //
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const data: Partial<GameReview> = {
  //     gameId: selectedGame!.id,
  //     score: Number(calculateOverallScore()?.toFixed(1)),
  //     isAdvanceReview: isAdvanced,
  //     scoreGameplay: advancedScores.graphics.score,
  //     scoreContent: advancedScores.content.score,
  //     scoreSound: advancedScores.sound.score,
  //     scoreStory: advancedScores.story.score,
  //     scoreGraphic: advancedScores.graphics.score,
  //     review: review,
  //   };
  //
  //   window.game.setReview(data);
  // };
  //
  // const handleReset = () => {
  //   setReview("");
  //   setOverallScore(0);
  //   setOverallHover(0);
  //   setAdvancedScores({
  //     graphics: { score: 0, hover: 0 },
  //     gameplay: { score: 0, hover: 0 },
  //     story: { score: 0, hover: 0 },
  //     sound: { score: 0, hover: 0 },
  //     content: { score: 0, hover: 0 },
  //   });
  //   setSubmitted(false);
  // };
  //
  // return (
  //   <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
  //     <Tile>
  //       <CardHeader>
  //         <CardTitle>Game Review</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         {!submitted ? (
  //           <form onSubmit={handleSubmit} className="space-y-6">
  //             <div className="flex items-center space-x-2">
  //               <Switch
  //                 id="advanced-mode"
  //                 checked={isAdvanced}
  //                 onCheckedChange={setIsAdvanced}
  //               />
  //               <Label htmlFor="advanced-mode">Advanced Review</Label>
  //             </div>
  //
  //             {!isAdvanced ? (
  //               <div className="space-y-2">
  //                 <label className="block text-sm font-medium">
  //                   Overall Score: {((overallHover || overallScore) ?? 0).toFixed(1)}
  //                   /10
  //                 </label>
  //                 <StarRating
  //                   value={overallScore}
  //                   hover={overallHover}
  //                   onHover={setOverallHover}
  //                   onClick={setOverallScore}
  //                 />
  //               </div>
  //             ) : (
  //               <div className="space-y-4">
  //                 {Object.entries(advancedScores).map(([category, scores]) => (
  //                   <div key={category} className="space-y-2">
  //                     <label className="block text-sm font-medium capitalize">
  //                       {category}: {(scores.hover || scores.score).toFixed(1)}
  //                       /10
  //                     </label>
  //                     <StarRating
  //                       value={scores.score}
  //                       hover={scores.hover}
  //                       onHover={(value) =>
  //                         updateAdvancedScore(category, value, true)
  //                       }
  //                       onClick={(value) =>
  //                         updateAdvancedScore(category, value)
  //                       }
  //                     />
  //                   </div>
  //                 ))}
  //                 <div className="border-t pt-2">
  //                   <p className="text-sm font-medium">
  //                     Overall Score: {calculateOverallScore().toFixed(1)}/10
  //                   </p>
  //                 </div>
  //               </div>
  //             )}
  //
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium">Your Review</label>
  //               <Textarea
  //                 value={review}
  //                 onChange={(e) => setReview(e.target.value)}
  //                 placeholder="Write your review here..."
  //                 className="h-32"
  //               />
  //             </div>
  //
  //             <Button type="submit" className="w-full">
  //               Save
  //             </Button>
  //           </form>
  //         ) : (
  //           <div className="space-y-4">
  //             {isAdvanced ? (
  //               <div className="space-y-4">
  //                 {Object.entries(advancedScores).map(([category, scores]) => (
  //                   <div key={category} className="space-y-2">
  //                     <span className="block text-sm font-medium capitalize">
  //                       {category}: {scores.score.toFixed(1)}/10
  //                     </span>
  //                     <StarRating
  //                       value={scores.score}
  //                       hover={0}
  //                       onHover={() => {}}
  //                       onClick={() => {}}
  //                     />
  //                   </div>
  //                 ))}
  //                 <div className="border-t pt-2">
  //                   <p className="text-sm font-medium">
  //                     Overall Score: {calculateOverallScore().toFixed(1)}/10
  //                   </p>
  //                 </div>
  //               </div>
  //             ) : (
  //               <div className="space-y-2">
  //                 <span className="font-medium">
  //                   Overall Score: {overallScore.toFixed(1)}/10
  //                 </span>
  //                 <StarRating
  //                   value={overallScore}
  //                   hover={0}
  //                   onHover={() => {}}
  //                   onClick={() => {}}
  //                 />
  //               </div>
  //             )}
  //
  //             <div>
  //               <span className="font-medium">Your Review:</span>
  //               <p className="mt-2 whitespace-pre-wrap">{review}</p>
  //             </div>
  //
  //             <Button onClick={handleReset} className="w-full">
  //               Write Another Review
  //             </Button>
  //           </div>
  //         )}
  //       </CardContent>
  //     </Tile>
  //   </div>
  // );
};
