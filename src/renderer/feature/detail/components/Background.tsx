import { useGames } from "@render//context/DatabaseContext";
import React, { useEffect, useState, useRef } from "react";
import useGameStore from "../store/GameStore";
import { useQuery } from "@tanstack/react-query";
import { getGameBackground } from "../api/DetailApi";

interface Props {
  children: any;
}

export const Background = ({ children }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIndex, setFadeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Use refs to store timeout and interval IDs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const game = useGameStore((state) => state.game);
  const id = game?.id;

  const { data, isPending, isError } = useQuery({
    queryKey: ["backgrounds", id],
    queryFn: () => getGameBackground(id),
    enabled: !!id,
  });

  // Reset indices when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setCurrentIndex(0);
      setFadeIndex(0);
      setIsFading(false);
    }
  }, [data]);

  useEffect(() => {
    // Clean up previous intervals/timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set up cycling if we have multiple backgrounds
    if (data && data.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length;
          setFadeIndex(nextIndex);
          setIsFading(true);

          timeoutRef.current = setTimeout(() => {
            setCurrentIndex(nextIndex);
            setIsFading(false);
          }, 900);

          return prevIndex; // Don't update currentIndex here, do it in setTimeout
        });
      }, 12000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data]); // Now properly depends on data

  // Handle loading state
  if (isPending) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-64 animate-pulse rounded-xl bg-gray-800"></div>
      </div>
    );
  }

  // Handle error state
  if (isError || !data || data.length === 0) {
    return (
      <div className="relative flex h-96 transform items-center justify-evenly gap-32 overflow-hidden bg-gray-900">
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[33vh] transform items-end justify-around gap-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center object-center transition-opacity duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${data[currentIndex]})`,
          backgroundAttachment: "fixed",
          opacity: isFading ? 0.99 : 1,
        }}
      />
      {data.length > 1 && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${data[fadeIndex]})`,
            backgroundAttachment: "fixed",
            opacity: isFading ? 0.5 : 0,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
