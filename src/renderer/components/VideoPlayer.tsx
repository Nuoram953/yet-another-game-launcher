import React, { useEffect, useRef, useState } from "react";

export const VideoPlayer = ({ path }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(0.1); // Volume ranges from 0.0 (muted) to 1.0 (max)

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

    // Listen to blur and focus events from the preload script
    window.appControl.onAppBlur(handleBlur);
    window.appControl.onAppFocus(handleFocus);

    // Cleanup event listeners
    return () => {
      window.appControl.onAppBlur(() => {});
      window.appControl.onAppFocus(() => {});
    };
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
      <video
        ref={videoRef}
        controls
        autoPlay
        loop
        className="rounded-xl w-full"
      >
        <source src={path} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
