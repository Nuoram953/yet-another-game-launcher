import React, { useEffect, useRef, useState } from "react";

export const VideoPlayer = ({ path }: { path: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(0.1);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
    const handleBlur = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.muted = true;
      }
    };

    const handleFocus = () => {
      if (videoRef.current) {
        videoRef.current.play();
        videoRef.current.muted = false;
      }
    };

    window.appControl.onAppBlur(handleBlur);
    window.appControl.onAppFocus(handleFocus);

    return () => {
      window.appControl.onAppBlur(() => {});
      window.appControl.onAppFocus(() => {});
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = e.target.value;
    setVolume(Number(newVolume));
    if (videoRef.current) {
      videoRef.current.volume = Number(newVolume);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        controls
        autoPlay
        loop
        className="w-full rounded-xl"
      >
        <source src={path} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
