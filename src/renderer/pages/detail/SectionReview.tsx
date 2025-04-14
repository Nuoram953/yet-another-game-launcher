import React, { useState } from "react";
import { Minus, Plus, Star, StarHalf, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tile } from "./Tile";
import { GameReview } from "@prisma/client";
import { useGames } from "@/context/DatabaseContext";

// export const SectionReview = () => {
//  const { selectedGame } = useGames();
//   const [isAdvanced, setIsAdvanced] = useState(
//     selectedGame?.review?.isAdvanceReview ?? false,
//   );
//   const [review, setReview] = useState(selectedGame?.review?.review);
//   const [submitted, setSubmitted] = useState(false);
//
//   // Basic score
//   const [overallScore, setOverallScore] = useState(selectedGame?.review?.score);
//   const [overallHover, setOverallHover] = useState(0);
//
//   // Advanced scores
//   const [advancedScores, setAdvancedScores] = useState({
//     graphics: { score: selectedGame?.review?.scoreGraphic, hover: 0 },
//     gameplay: { score: selectedGame?.review?.scoreGameplay, hover: 0 },
//     story: { score: selectedGame?.review?.scoreStory, hover: 0 },
//     sound: { score: selectedGame?.review?.scoreSound, hover: 0 },
//     content: { score: selectedGame?.review?.scoreContent, hover: 0 },
//   });
//
//   const updateAdvancedScore = (category, value, isHover = false) => {
//     setAdvancedScores((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [isHover ? "hover" : "score"]: value,
//       },
//     }));
//   };
//
//   const calculateOverallScore = () => {
//     if (!isAdvanced) return overallScore;
//     const scores = Object.values(advancedScores).map((s) => s.score);
//     return scores.reduce((a, b) => a + b, 0) / scores.length;
//   };
//
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const data: Partial<GameReview> = {
//       gameId: selectedGame!.id,
//       score: Number(calculateOverallScore()?.toFixed(1)),
//       isAdvanceReview: isAdvanced,
//       scoreGameplay: advancedScores.graphics.score,
//       scoreContent: advancedScores.content.score,
//       scoreSound: advancedScores.sound.score,
//       scoreStory: advancedScores.story.score,
//       scoreGraphic: advancedScores.graphics.score,
//       review: review,
//     };
//
//     window.game.setReview(data);
//   };
//
//   const handleReset = () => {
//     setReview("");
//     setOverallScore(0);
//     setOverallHover(0);
//     setAdvancedScores({
//       graphics: { score: 0, hover: 0 },
//       gameplay: { score: 0, hover: 0 },
//       story: { score: 0, hover: 0 },
//       sound: { score: 0, hover: 0 },
//       content: { score: 0, hover: 0 },
//     });
//     setSubmitted(false);
//   };
//
//   return (
//     <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
//       <Tile>
//         <CardHeader>
//           <CardTitle>Game Review</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {!submitted ? (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="flex items-center space-x-2">
//                 <Switch
//                   id="advanced-mode"
//                   checked={isAdvanced}
//                   onCheckedChange={setIsAdvanced}
//                 />
//                 <Label htmlFor="advanced-mode">Advanced Review</Label>
//               </div>
//
//               {!isAdvanced ? (
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium">
//                     Overall Score: {((overallHover || overallScore) ?? 0).toFixed(1)}
//                     /10
//                   </label>
//                   <StarRating
//                     value={overallScore}
//                     hover={overallHover}
//                     onHover={setOverallHover}
//                     onClick={setOverallScore}
//                   />
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {Object.entries(advancedScores).map(([category, scores]) => (
//                     <div key={category} className="space-y-2">
//                       <label className="block text-sm font-medium capitalize">
//                         {category}: {(scores.hover || scores.score).toFixed(1)}
//                         /10
//                       </label>
//                       <StarRating
//                         value={scores.score}
//                         hover={scores.hover}
//                         onHover={(value) =>
//                           updateAdvancedScore(category, value, true)
//                         }
//                         onClick={(value) =>
//                           updateAdvancedScore(category, value)
//                         }
//                       />
//                     </div>
//                   ))}
//                   <div className="border-t pt-2">
//                     <p className="text-sm font-medium">
//                       Overall Score: {calculateOverallScore().toFixed(1)}/10
//                     </p>
//                   </div>
//                 </div>
//               )}
//
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium">Your Review</label>
//                 <Textarea
//                   value={review}
//                   onChange={(e) => setReview(e.target.value)}
//                   placeholder="Write your review here..."
//                   className="h-32"
//                 />
//               </div>
//
//               <Button type="submit" className="w-full">
//                 Save
//               </Button>
//             </form>
//           ) : (
//             <div className="space-y-4">
//               {isAdvanced ? (
//                 <div className="space-y-4">
//                   {Object.entries(advancedScores).map(([category, scores]) => (
//                     <div key={category} className="space-y-2">
//                       <span className="block text-sm font-medium capitalize">
//                         {category}: {scores.score.toFixed(1)}/10
//                       </span>
//                       <StarRating
//                         value={scores.score}
//                         hover={0}
//                         onHover={() => {}}
//                         onClick={() => {}}
//                       />
//                     </div>
//                   ))}
//                   <div className="border-t pt-2">
//                     <p className="text-sm font-medium">
//                       Overall Score: {calculateOverallScore().toFixed(1)}/10
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   <span className="font-medium">
//                     Overall Score: {overallScore.toFixed(1)}/10
//                   </span>
//                   <StarRating
//                     value={overallScore}
//                     hover={0}
//                     onHover={() => {}}
//                     onClick={() => {}}
//                   />
//                 </div>
//               )}
//
//               <div>
//                 <span className="font-medium">Your Review:</span>
//                 <p className="mt-2 whitespace-pre-wrap">{review}</p>
//               </div>
//
//               <Button onClick={handleReset} className="w-full">
//                 Write Another Review
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Tile>
//     </div>
//   );
// };
export function SectionReview() {
  const [gameTitle, setGameTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [pros, setPros] = useState(['']);
  const [cons, setCons] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [saved, setSaved] = useState(false);
  
  // Category ratings
  const [categoryRatings, setCategoryRatings] = useState({
    graphics: 5,
    gameplay: 5,
    story: 5,
    sound: 5,
    content: 5
  });
  
  const handleRatingClick = (value) => {
    setRating(value);
  };
  
  const handleProsChange = (index, value) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };
  
  const handleConsChange = (index, value) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };
  
  const handleTagsChange = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };
  
  const handleCategoryChange = (category, value) => {
    setCategoryRatings({
      ...categoryRatings,
      [category]: value
    });
  };
  
  const addItem = (list, setList) => {
    setList([...list, '']);
  };
  
  const removeItem = (list, setList, index) => {
    if (list.length > 1) {
      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);
    }
  };
  

  // Category label and color mapping
  const getCategoryColor = (value) => {
    if (value <= 2) return 'bg-red-500';
    if (value <= 4) return 'bg-yellow-500';
    if (value <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getCategoryLabel = (value) => {
    if (value <= 2) return 'Poor';
    if (value <= 4) return 'Fair';
    if (value <= 7) return 'Good';
    if (value <= 9) return 'Great';
    return 'Excellent';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Create Game Review</h2>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={24}
              className={`cursor-pointer ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Category Ratings</h3>
          
          {Object.entries({
            graphics: "Graphics",
            gameplay: "Gameplay",
            story: "Story",
            sound: "Sound",
            content: "Content"
          }).map(([key, label]) => (
            <div key={key} className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 font-medium">{label}</label>
                <span className={`px-2 py-1 rounded-md text-xs text-white ${getCategoryColor(categoryRatings[key])}`}>
                  {categoryRatings[key]}/10 - {getCategoryLabel(categoryRatings[key])}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={categoryRatings[key]}
                onChange={(e) => handleCategoryChange(key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Review</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pros</label>
            {pros.map((pro, index) => (
              <div key={`pro-${index}`} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a pro"
                  value={pro}
                  onChange={(e) => handleProsChange(index, e.target.value)}
                />
                <button 
                  onClick={() => removeItem(pros, setPros, index)} 
                  className="bg-red-500 text-white px-2 py-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addItem(pros, setPros)} 
              className="flex items-center text-blue-600 mt-1"
            >
              <Plus size={18} className="mr-1" />
              Add Pro
            </button>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cons</label>
            {cons.map((con, index) => (
              <div key={`con-${index}`} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a con"
                  value={con}
                  onChange={(e) => handleConsChange(index, e.target.value)}
                />
                <button 
                  onClick={() => removeItem(cons, setCons, index)} 
                  className="bg-red-500 text-white px-2 py-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addItem(cons, setCons)} 
              className="flex items-center text-blue-600 mt-1"
            >
              <Plus size={18} className="mr-1" />
              Add Con
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
