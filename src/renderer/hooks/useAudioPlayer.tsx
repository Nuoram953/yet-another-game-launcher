import { useEffect } from "react";

type UseAudioPlayerOptions = {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
  enabled: boolean;
  volume?: number;
};

export function useAudioPlayer({ audioRef, src, enabled, volume = 0.4 }: UseAudioPlayerOptions) {
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled && src) {
      if (audio.src !== src) {
        audio.src = src;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [enabled, src]);

  useEffect(() => {
    const onBlur = () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.muted = true;
    };

    const onFocus = () => {
      if (!audioRef.current) return;
      audioRef.current.muted = false;
      if (enabled) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.appControl.onAppBlur(onBlur);
    window.appControl.onAppFocus(onFocus);

    return () => {
      window.appControl.onAppBlur?.(onBlur);
      window.appControl.onAppFocus?.(onFocus);
    };
  }, [enabled]);
}
