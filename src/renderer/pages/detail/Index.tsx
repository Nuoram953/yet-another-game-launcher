import React, { useEffect, useState } from "react";
import {
  Trophy,
  Activity,
  PenLine,
  Star,
  BookOpen,
  Settings,
  MessageSquare,
  Image as ImageIcon,
  Trash,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Background } from "./Background";
import { Logo } from "./Logo";
import { useGames } from "@/context/DatabaseContext";
import { SectionMetadata } from "./SectionMetadata";
import { ButtonPlay } from "@/components/button/Play";
import { SectionOverview } from "./overview/Index";
import { SectionAchievements } from "./SectionAchievements";
import { SectionSession } from "./SectionSession";
import { SectionSettings } from "./settings/Index";
import { SectionReview } from "./SectionReview";
import { SectionActivities } from "./activities/Index";
import { Container } from "@/components/Container";
import { ImageWithFallback } from "@/components/cover/cover";

interface Section {
  id: string;
  icon: React.FC<any>;
  label: string;
  show: boolean;
}

const GameDetailsContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const [cover, setCover] = useState<string | null>(null);
  const { selectedGame, running, updateSelectedGame } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const result = await window.library.getGame(id);
        if (result) {
          await updateSelectedGame(result);
          const covers = await window.media.getCovers(id);
          setCover(covers[0]);
          setLoading(false);

          setBreadcrumbs([
            { path: "/", label: "Library" },
            { path: `/game/${result.id}`, label: result.name },
          ]);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchData();
  }, [id, setBreadcrumbs, updateSelectedGame]);

  const sectionGroups: Record<string, Section[]> = {
    gameContent: [
      {
        id: "session",
        icon: BookOpen,
        label: "Active session",
        show: running.some((item) => item.id === selectedGame?.id),
      },
      { id: "overview", icon: BookOpen, label: "Overview", show: true },
      {
        id: "achievements",
        icon: Trophy,
        label: "Achievements",
        show: !!selectedGame?.achievements?.length,
      },
      {
        id: "activities",
        icon: Activity,
        label: "Activities",
        show: !!selectedGame?.activities?.length,
      },
    ],
    socialFeatures: [
      { id: "notes", icon: PenLine, label: "Notes", show: true },
      { id: "reviews", icon: Star, label: "Reviews", show: true },
      { id: "community", icon: MessageSquare, label: "Community", show: true },
    ],
    system: [
      { id: "metadata", icon: ImageIcon, label: "Metadata", show: true },
      { id: "settings", icon: Settings, label: "Settings", show: true },
    ],
  };

  const sections: Section[] = [
    ...sectionGroups.gameContent,
    ...sectionGroups.socialFeatures,
    ...sectionGroups.system,
  ];

  interface ComponentMapping {
    [key: string]: React.ComponentType<any>;
  }

  const renderContent = () => {
    if (loading || !selectedGame) {
      return (
        <div className="space-y-4 p-6">
          <div className="h-64 animate-pulse rounded-xl bg-gray-800"></div>
          <div className="h-32 animate-pulse rounded-xl bg-gray-800"></div>
          <div className="h-24 animate-pulse rounded-xl bg-gray-800"></div>
        </div>
      );
    }

    const components: ComponentMapping = {
      session: SectionSession,
      overview: SectionOverview,
      metadata: SectionMetadata,
      achievements: SectionAchievements,
      settings: SectionSettings,
      reviews: SectionReview,
      activities: SectionActivities,
    };

    const ActiveComponent = components[activeSection];

    if (ActiveComponent) {
      return <ActiveComponent />;
    }

    return (
      <div className="animate-fadeIn rounded-xl bg-gray-800/50 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-xl font-bold">
          {sections.find((s) => s.id === activeSection)?.label}
        </h2>
        <p className="text-gray-400">Content for {activeSection} section</p>
      </div>
    );
  };

  const getIconStyle = (sectionId: string): string =>
    `transition-transform duration-200 ${activeSection === sectionId ? "scale-110" : ""}`;

  const renderSectionGroup = (title: string, sectionList: Section[]) => {
    const filteredSections = sectionList.filter((section) => section.show);
    if (filteredSections.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-2 px-4 text-xs font-medium uppercase tracking-wider text-gray-400">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredSections.map((section, index) => (
            <Button
              key={section.id}
              variant="ghost"
              className={`w-full justify-start rounded-none px-4 py-3 transition-all duration-200 hover:bg-gray-700/70 ${
                activeSection === section.id
                  ? "border-l-2 border-blue-400 bg-gradient-to-r from-blue-900/50 to-transparent"
                  : ""
              }`}
              onClick={() => setActiveSection(section.id)}
              style={{
                animation: "slideIn 0.5s ease-out forwards",
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div
                className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                  activeSection === section.id
                    ? "bg-gray-800/50 text-blue-200"
                    : "bg-gray-800/70 text-gray-400"
                }`}
              >
                <section.icon
                  className={`h-4 w-4 ${getIconStyle(section.id)}`}
                />
              </div>
              <span
                className={
                  activeSection === section.id
                    ? "font-medium text-white"
                    : "text-gray-300"
                }
              >
                {section.label}
              </span>
              {activeSection === section.id && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-400"></div>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Background>
        <div className="flex flex-col items-center justify-center gap-8">
          <Logo />
          <ButtonPlay />
        </div>
      </Background>

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={`flex flex-col transition-all duration-300 ${
            collapsed ? "w-16" : "w-72"
          } bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg`}
        >
          <div className="relative bg-gradient-to-b from-gray-700/80 to-gray-800/80 p-4 backdrop-blur-lg">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
              />
            </Button>

            <div className="overflow-hidden rounded-lg shadow-md">
              <ImageWithFallback
                src={cover}
                className="h-auto w-full"
                alt={undefined}
                style={undefined}
              />
            </div>

            {!collapsed && (
              <div className="mt-3 text-center">
                <h2 className="text-sm font-bold text-white">
                  {selectedGame?.name}
                </h2>
              </div>
            )}
          </div>

          <div className="scrollbar-thin scrollbar-thumb-gray-700 flex-1 overflow-y-auto py-4">
            {!collapsed ? (
              <>
                {renderSectionGroup("Game Content", sectionGroups.gameContent)}
                <div className="mx-4 my-4 h-px bg-gray-700/50"></div>
                {renderSectionGroup(
                  "Social Features",
                  sectionGroups.socialFeatures,
                )}
                <div className="mx-4 my-4 h-px bg-gray-700/50"></div>
                {renderSectionGroup("System", sectionGroups.system)}
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4 px-2">
                {sections
                  .filter((section) => section.show)
                  .map((section) => (
                    <Button
                      key={section.id}
                      variant="ghost"
                      className={`h-10 w-10 rounded-full p-0 ${
                        activeSection === section.id
                          ? "bg-blue-900/50 text-blue-200"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                      title={section.label}
                    >
                      <section.icon className="h-5 w-5" />
                    </Button>
                  ))}
              </div>
            )}
          </div>

          {selectedGame?.isInstalled && (
            <div className="bg-gray-800/80 p-4">
              <Button
                variant="destructive"
                className={`w-full ${!collapsed ? "justify-start" : "justify-center"}`}
                onClick={() => window.game.uninstall(selectedGame.id)}
              >
                <Trash className={`h-4 w-4 ${!collapsed ? "mr-2" : ""}`} />
                {!collapsed && <span>Uninstall</span>}
              </Button>
            </div>
          )}
        </div>

        <Container className="relative z-20 max-w-[1500px] flex-1 overflow-y-auto p-2">
          {renderContent()}
        </Container>
      </div>
    </div>
  );
};

export default GameDetailsContent;
