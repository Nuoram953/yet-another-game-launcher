import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";

const Info = () => {
  const { selectedGame } = useGames();

  return (
    <Card title={""}>
      <div className="mb-6 flex flex-col gap-6 md:flex-row">
        <div className="flex-grow">
          <h1 className="mb-2 text-3xl font-bold">{selectedGame.name}</h1>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-gray-600">
              {selectedGame?.developers.length &&
                selectedGame?.developers[0].company.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {selectedGame?.publishers.length &&
                selectedGame?.publishers[0].company.name}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-gray-400">{selectedGame?.summary}</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedGame?.tags
                .filter((item) => item.isGenre)
                .map((genre) => (
                  <Badge
                    key={genre.tag.name}
                    variant="secondary"
                    className="text-sm"
                  >
                    {genre.tag.name}
                  </Badge>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedGame?.tags
                .filter((item) => item.isTheme)
                .map((item) => (
                  <Badge
                    key={item.tag.name}
                    variant="secondary"
                    className="text-sm"
                  >
                    {item.tag.name}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500" />
          <div>
            <div className="text-2xl font-bold">
              {selectedGame?.scoreCritic}
            </div>
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

      <div className="border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Available Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {[].map((platform) => (
            <Badge key={platform} variant="secondary">
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Awards & Recognition</h3>
        <ul className="list-inside list-disc text-gray-700">
          {[].map((award) => (
            <li key={award}>{award}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default Info;
