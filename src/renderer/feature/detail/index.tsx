import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useGameStore from "./store/GameStore";
import { useQuery } from "@tanstack/react-query";
import { getGameDetails } from "./api/DetailApi";
import { Trailer } from "./components/Trailer";
import { useGameCover } from "./hooks/useCover";
import { useDominantColor } from "@render/hooks/useDominantColor";
import { useActiveSection } from "./hooks/useActiveSection";
import { DetailsAchievements } from "../detail-achievements";
import { Container } from "@render/components/layout/Container";
import { ChartNoAxesGantt, Clock, EllipsisVertical, Image, Pencil, Settings, Trophy } from "lucide-react";
import { DetailsOverview } from "../detail-overview";
import { DetailsActivities } from "../detail-activities";
import { DetailsReviews } from "../detail-reviews";
import useColorStore from "./store/ColorStore";
import { ButtonPlay } from "@render/components/button/Play";
import { Navbar } from "@render/components/new/navbar";
import { Dropdown } from "@render/components/new/dropdown";
import { getGame } from "@render/api/electron";
import _ from "lodash";
import { useBreadcrumbsContext } from "@render/context/BreadcrumbsContext";
import { useTranslation } from "react-i18next";
import { DetailsMetadata } from "../detail-metadata";
import { DetailsSettings } from "../detail-settings";

export const DetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { activeSection, setActiveSection } = useActiveSection();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const game = useGameStore((state) => state.game);
  const setGame = useGameStore((state) => state.setGame);
  const reset = useGameStore((state) => state.reset);
  const subscribeToGame = useGameStore((state) => state.subscribeToGame);

  useEffect(() => {
    subscribeToGame();
  }, [subscribeToGame]);

  const gameQuery = useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      reset();
      const game = await getGameDetails(id);
      setGame(game);
      setBreadcrumbs([
        { path: "/", label: "Library" },
        { path: `/library/game/${game.id}`, label: game.name },
      ]);

      return game;
    },
    enabled: !!id,
  });

  const { data, isPending } = useGameCover(id);
  const { backgroundColor, textColor } = useDominantColor(data?.[0], !isPending);
  const setTheme = useColorStore((state) => state.setTheme);
  setTheme({
    background: backgroundColor,
    foreground: backgroundColor,
    text: textColor === "black" ? "text-black" : "text-white",
    subtleText: textColor === "black" ? "text-black/50" : "text-gray-300",
    border: textColor === "black" ? "border-black" : "border-white",
    isDark: textColor === "black",
  });

  if (gameQuery.isPending || _.isNil(game)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (gameQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Error loading game details</div>
      </div>
    );
  }

  console.log(gameQuery.data);

  return (
    <Container>
      <Trailer />
      <Navbar backgroundColor={backgroundColor} textColor={textColor} isFixed>
        <Navbar.Section>
          <ButtonPlay />
        </Navbar.Section>
        <Navbar.Section>
          <Navbar.Item onClick={() => setActiveSection("overview")} icon={<ChartNoAxesGantt />}>
            <span className="ml-1 hidden lg:inline">Overview</span>
          </Navbar.Item>
          <Navbar.Item
            icon={<Trophy />}
            onClick={() => setActiveSection("achievements")}
            disabled={game.achievements.length === 0}
          >
            <span className="ml-1 hidden lg:inline">Achievements</span>
          </Navbar.Item>
          <Navbar.Item
            icon={<Clock />}
            onClick={() => setActiveSection("activities")}
            disabled={game.activities.length === 0}
          >
            <span className="ml-1 hidden lg:inline">Activities</span>
          </Navbar.Item>
          <Navbar.Item icon={<Pencil />} onClick={() => setActiveSection("reviews")}>
            <span className="ml-1 hidden lg:inline">Reviews</span>
          </Navbar.Item>
          <Navbar.Item icon={<Image />} onClick={() => setActiveSection("metadata")}>
            <span className="ml-1 hidden lg:inline">Metadata</span>
          </Navbar.Item>
          <Navbar.Item icon={<Settings />} onClick={() => setActiveSection("settings")}>
            <span className="ml-1 hidden lg:inline">Settings</span>
          </Navbar.Item>
          <Navbar.Item>
            <Dropdown>
              <Dropdown.Trigger>
                <EllipsisVertical />
              </Dropdown.Trigger>
              <Dropdown.Content>
                <Dropdown.Item
                  disabled={!game.isInstalled}
                  onClick={() => {
                    getGame().uninstall(gameQuery.data.id);
                  }}
                >
                  Uninstall
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    getGame().setFavorite(game.id, !game.isFavorite);
                  }}
                >
                  {game.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => {
                    getGame().refreshInfo(gameQuery.data.id);
                  }}
                >
                  Refresh
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown>
          </Navbar.Item>
        </Navbar.Section>
      </Navbar>
      <div className="relative w-full">
        <div className="relative z-10 m-4">
          {activeSection === "overview" && <DetailsOverview />}
          {activeSection === "achievements" && <DetailsAchievements />}
          {activeSection === "activities" && <DetailsActivities />}
          {activeSection === "reviews" && <DetailsReviews />}
          {activeSection === "metadata" && <DetailsMetadata />}
          {activeSection === "settings" && <DetailsSettings />}
        </div>
      </div>
    </Container>
  );
};
