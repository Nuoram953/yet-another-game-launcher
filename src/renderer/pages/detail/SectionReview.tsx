import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tile } from './Tile';
import { GameReview } from '@prisma/client';
import { useGames } from '@/context/DatabaseContext';

const StarRating = ({ value, hover, onHover, onClick }) => {
  const renderStar = (starNumber) => {
    const isHalf = value + 0.5 === starNumber;
    const isFull = value >= starNumber;
    const hoverHalf = hover + 0.5 === starNumber;
    const hoverFull = hover >= starNumber;
    
    const displayValue = hover > 0 ? (hoverHalf ? 'half' : (hoverFull ? 'full' : 'empty')) 
                                  : (isHalf ? 'half' : (isFull ? 'full' : 'empty'));

    return (
      <div 
        key={starNumber}
        className="relative inline-block"
        style={{ width: '24px' }}
      >
        {/* Base star */}
        <Star size={24} className="text-gray-300" />
        
        {/* Colored overlay */}
        <div className="absolute top-0 left-0">
          {(displayValue === 'half') && (
            <StarHalf size={24} className="fill-yellow-400 text-yellow-400" />
          )}
          {(displayValue === 'full') && (
            <Star size={24} className="fill-yellow-400 text-yellow-400" />
          )}
        </div>
        
        {/* Click handlers */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onMouseEnter={() => onHover(starNumber - 0.5)}
            onClick={() => onClick(starNumber - 0.5)}
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onMouseEnter={() => onHover(starNumber)}
            onClick={() => onClick(starNumber)}
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex gap-1" 
      onMouseLeave={() => onHover(0)}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => renderStar(num))}
    </div>
  );
};

export const SectionReview = () => {
  const {selectedGame} = useGames()
  const [isAdvanced, setIsAdvanced] = useState(selectedGame?.review?.isAdvanceReview ?? false);
  const [review, setReview] = useState(selectedGame?.review?.review);
  const [submitted, setSubmitted] = useState(false);
  
  // Basic score
  const [overallScore, setOverallScore] = useState(selectedGame?.review?.score);
  const [overallHover, setOverallHover] = useState(0);
  
  // Advanced scores
  const [advancedScores, setAdvancedScores] = useState({
    graphics: { score: selectedGame?.review?.scoreGraphic, hover: 0 },
    gameplay: { score: selectedGame?.review?.scoreGameplay, hover: 0 },
    story: { score: selectedGame?.review?.scoreStory, hover: 0 },
    sound: { score: selectedGame?.review?.scoreSound, hover: 0 },
    content: { score: selectedGame?.review?.scoreContent, hover: 0 }
  });

  const updateAdvancedScore = (category, value, isHover = false) => {
    setAdvancedScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [isHover ? 'hover' : 'score']: value
      }
    }));
  };

  const calculateOverallScore = () => {
    if (!isAdvanced) return overallScore;
    const scores = Object.values(advancedScores).map(s => s.score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data:Partial<GameReview> = {
      gameId: selectedGame!.id,
      score: overallScore,
      isAdvanceReview: isAdvanced,
      scoreGameplay: advancedScores.graphics.score,
      scoreContent: advancedScores.content.score,
      scoreSound: advancedScores.sound.score,
      scoreStory: advancedScores.story.score,
      scoreGraphic: advancedScores.graphics.score,
      review: review
    }

    console.log(data)

    window.game.setReview(data)
  };

  const handleReset = () => {
    setReview('');
    setOverallScore(0);
    setOverallHover(0);
    setAdvancedScores({
      graphics: { score: 0, hover: 0 },
      gameplay: { score: 0, hover: 0 },
      story: { score: 0, hover: 0 },
      sound: { score: 0, hover: 0 },
      content: { score: 0, hover: 0 }
    });
    setSubmitted(false);
  };

  return (

    <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
    <Tile>
      <CardHeader>
        <CardTitle>Game Review</CardTitle>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-mode"
                checked={isAdvanced}
                onCheckedChange={setIsAdvanced}
              />
              <Label htmlFor="advanced-mode">Advanced Review</Label>
            </div>

            {!isAdvanced ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Overall Score: {(overallHover || overallScore).toFixed(1)}/10
                </label>
                <StarRating
                  value={overallScore}
                  hover={overallHover}
                  onHover={setOverallHover}
                  onClick={setOverallScore}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(advancedScores).map(([category, scores]) => (
                  <div key={category} className="space-y-2">
                    <label className="block text-sm font-medium capitalize">
                      {category}: {(scores.hover || scores.score).toFixed(1)}/10
                    </label>
                    <StarRating
                      value={scores.score}
                      hover={scores.hover}
                      onHover={(value) => updateAdvancedScore(category, value, true)}
                      onClick={(value) => updateAdvancedScore(category, value)}
                    />
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Overall Score: {calculateOverallScore().toFixed(1)}/10
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Review</label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                className="h-32"
              />
            </div>

            <Button type="submit" className="w-full">
                Save
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {isAdvanced ? (
              <div className="space-y-4">
                {Object.entries(advancedScores).map(([category, scores]) => (
                  <div key={category} className="space-y-2">
                    <span className="block text-sm font-medium capitalize">
                      {category}: {scores.score.toFixed(1)}/10
                    </span>
                    <StarRating
                      value={scores.score}
                      hover={0}
                      onHover={() => {}}
                      onClick={() => {}}
                    />
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    Overall Score: {calculateOverallScore().toFixed(1)}/10
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="font-medium">Overall Score: {overallScore.toFixed(1)}/10</span>
                <StarRating
                  value={overallScore}
                  hover={0}
                  onHover={() => {}}
                  onClick={() => {}}
                />
              </div>
            )}
            
            <div>
              <span className="font-medium">Your Review:</span>
              <p className="mt-2 whitespace-pre-wrap">{review}</p>
            </div>

            <Button onClick={handleReset} className="w-full">
              Write Another Review
            </Button>
          </div>
        )}
      </CardContent>
    </Tile>
    </div>
  );
};
