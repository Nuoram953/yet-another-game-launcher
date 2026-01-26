import VideoPlayer from "@render//components/VideoPlayer";
import React, { useRef } from "react";
import { Logo } from "@render/components/image/Logo";
import { useParams } from "@tanstack/react-router";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useAudioPlayer } from "@render/hooks/useAudioPlayer";
import { useMedia } from "@render/api/get-media-by-type";
import { MEDIA_TYPE } from "@common/constant";

export const Trailer = () => {
  const { id } = useParams({ from: "/game/$id" });
  const audioRef = useRef<HTMLAudioElement>(null);

  const trailerQuery = useMedia({ data: { gameId: id, type: MEDIA_TYPE.TRAILER } });
  const backgroundQuery = useMedia({ data: { gameId: id, type: MEDIA_TYPE.BACKGROUND } });
  const musicQuery = useMedia({ data: { gameId: id, type: MEDIA_TYPE.MUSIC } });

  useAudioPlayer({ audioRef, src: musicQuery.data?.[0], enabled: true, volume: 0.2 });

  if (trailerQuery.isPending || backgroundQuery.isPending || musicQuery.isPending) {
    return <LoadingCenter />;
  }

  const trailer = trailerQuery.data?.[0];
  const background = backgroundQuery.data?.[0];
  const music = musicQuery.data?.[0];

  return (
    <div className="relative w-full shadow-lg">
      {trailer && <VideoPlayer path={trailer} muted={!!music} />}
      {music && <audio ref={audioRef} src={music} autoPlay loop />}

      {!trailer && background && <img src={background} className="h-[700px] w-full object-cover" />}

      <div className="absolute right-4 top-4 z-10 drop-shadow-lg sm:w-32 lg:w-64">
        <Logo gameId={id} />
      </div>
    </div>
  );
};
