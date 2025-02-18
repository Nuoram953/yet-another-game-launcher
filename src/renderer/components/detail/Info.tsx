import React, {useState, useEffect} from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Trophy } from 'lucide-react';
import Tile from '../Tile';
import { Card } from '../card/Card';
import { CardContent } from '../ui/card';
import { useGames } from '@/context/DatabaseContext';
import { ImageWithFallback } from '../cover/cover';

const Info = () => {
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const covers = await window.media.getCovers(selectedGame.id);
        setCover(covers[0]);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [selectedGame]);

  if (loading) {
    return <div>loading...</div>;
  }
  return (
      <Card title={""}>
        <CardContent className="pt-6">
          {/* Header with Cover and Title */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Cover Image */}

            {/* Title and Basic Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">{selectedGame.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-gray-600">{selectedGame?.developers.length && selectedGame?.developers[0].company.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{selectedGame?.publishers.length && selectedGame?.publishers[0].company.name}</span>
              </div>

              {/* Genres and Themes */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedGame?.tags.filter((item)=>item.isGenre).map(genre => (
                    <Badge key={genre.tag.name} variant="secondary" className="text-sm">
                      {genre.tag.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedGame?.tags.filter((item)=>item.isTheme).map(item => (
                    <Badge key={item.tag.name} variant="secondary" className="text-sm">
                      {item.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{selectedGame?.summary}</p>
          </div>

          {/* Scores and Release Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{selectedGame?.scoreCritic}</div>
                <div className="text-sm text-gray-600">Metacritic</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-500" />
              <div>
                <div className="text-lg font-semibold">
                  {new Date(selectedGame?.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Release Date</div>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Available Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {[].map(platform => (
                <Badge key={platform} variant="secondary">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="border-t mt-4 pt-4">
            <h3 className="text-lg font-semibold mb-2">Awards & Recognition</h3>
            <ul className="list-disc list-inside text-gray-700">
              {[].map(award => (
                <li key={award}>{award}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
  );
};

export default Info;
