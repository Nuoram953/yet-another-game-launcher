import VideoPlayer from "@render//components/VideoPlayer";
import useGameStore from "@render/feature/detail/store/GameStore";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getGameCover, getGameTrailers } from "../api/DetailApi";
import { IconAndText } from "@render/components/layout/Container";
import { Building } from "lucide-react";
import { Logo } from "./Logo";
import Cover from "@render/pages/grid/cover/Cover";
import { Image } from "@render/components/image/Image";
import { ButtonPlay } from "@render/components/button/Play";

export const Trailer = () => {
  const game = useGameStore((state) => state.game);
  const id = game?.id;
  const { data, isPending } = useQuery({
    queryKey: ["trailer", id],
    queryFn: () => getGameTrailers(id),
    enabled: !!id,
  });

  const coverQuery = useQuery({
    queryKey: ["cover", id],
    queryFn: () => getGameCover(id),
    enabled: !!id,
  });

  return (
    <>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className="relative w-full shadow-lg">
          <VideoPlayer path={data[0]} />
          <div className="absolute right-4 top-4 z-10 drop-shadow-lg sm:w-32 lg:w-64">
            <Logo />
          </div>
          <div className="absolute bottom-4 left-4 z-10 w-full drop-shadow-lg">
            <div className="flex flex-row gap-4">
              <Image src={coverQuery.data[0]} alt={""} className="h-52 rounded-md" />
              <div className="mt-2 flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-design-white">{game.name}</h1>

                <div className="flex flex-wrap gap-4">
                  {game.developers?.[0]?.company?.name && (
                    <IconAndText icon={<Building className="h-4 w-4" />} text={game.developers[0].company.name} />
                  )}
                  {game.publishers?.[0]?.company?.name && (
                    <IconAndText icon={<Building className="h-4 w-4" />} text={game.publishers[0].company.name} />
                  )}
                </div>

                <div className="max-w-[45vh] rounded-xl py-4">
                  <p className="line-clamp-3 leading-relaxed text-gray-200">{game.summary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
