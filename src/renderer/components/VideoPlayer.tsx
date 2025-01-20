import React, { useEffect, useRef, useState } from "react";

export const VideoPlayer = ({ path }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(0.0); // Volume ranges from 0.0 (muted) to 1.0 (max)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  return (
    <div>
      <video ref={videoRef} controls autoPlay className="rounded-xl w-full">
        <source src={path} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
