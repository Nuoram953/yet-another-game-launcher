import React, { useEffect, useState } from "react";
import {
  Trophy,
  Activity,
  PenLine,
  Star,
  BookOpen,
  Settings,
  MessageSquare,
  Image,
  Trash,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Background } from "./Background";
import { Logo } from "./Logo";
import { useGames } from "@/context/DatabaseContext";
import { SectionMetadata } from "./SectionMetadata";
import { ButtonPlay } from "@/components/button/Play";
import { SectionOverview } from "./SectionOverview";
import { SectionAchievements } from "./SectionAchievements";
import { SectionSession } from "./SectionSession";
import { SectionSettings } from "./settings/Index";
import { SectionReview } from "./SectionReview";
import { SectionActivities } from "./SectionActivities";
import { Container } from "@/components/Container";
import { ImageWithFallback } from "@/components/cover/cover";

const GameDetailsContent = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const [cover, setCover] = useState<string | null>(null);
  const { selectedGame, running, updateSelectedGame } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await window.library.getGame(id);
        if (result) {
          await updateSelectedGame(result);
          const covers = await window.media.getCovers(id);
          setCover(covers[0]);
          setLoading(false);
        }

        setBreadcrumbs([
          { path: "/", label: "Library" },
          { path: `/game/${result.id}`, label: result.name },
        ]);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchData();
  }, []);

  const sections = [
    {
      id: "session",
      icon: BookOpen,
      label: "Active session",
      show: running.map((item) => item.id).includes(selectedGame?.id),
    },
    { id: "overview", icon: BookOpen, label: "Overview", show: true },
    {
      id: "achievements",
      icon: Trophy,
      label: "Achievements",
      show: selectedGame?.achievements?.length,
    },
    {
      id: "activities",
      icon: Activity,
      label: "Activities",
      show: selectedGame?.activities?.length,
    },
    { id: "notes", icon: PenLine, label: "Notes", show: true },
    { id: "reviews", icon: Star, label: "Reviews", show: true },
    { id: "community", icon: MessageSquare, label: "Community", show: true },
    { id: "metadata", icon: Image, label: "Metadata", show: true },
    { id: "settings", icon: Settings, label: "Settings", show: true },
  ];

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

    const components = {
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

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Background>
        <div className="flex flex-col items-center justify-center gap-8">
          <Logo />
          <ButtonPlay />
        </div>
      </Background>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="absolute left-4 top-4 lg:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } absolute inset-y-0 left-0 z-30 w-64 transform bg-gray-800/50 p-4 backdrop-blur-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
        >
          <ImageWithFallback src={cover} />
          <hr />
          <div className="space-y-2">
            {sections
              .filter((section) => section.show)
              .map((section, index) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-lg transition-all duration-200 hover:bg-gray-700/50"
                  onClick={() => {
                    setActiveSection(section.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  style={{
                    animation: "slideIn 0.5s ease-out forwards",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <section.icon
                    className={`mr-2 h-4 w-4 transition-transform duration-200 ${
                      activeSection === section.id ? "scale-110" : ""
                    }`}
                  />
                  {section.label}
                </Button>
              ))}
          </div>

          {selectedGame?.isInstalled && (
            <Button
              variant="destructive"
              className="mt-4 w-full justify-start"
              onClick={() => window.game.uninstall(selectedGame.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Uninstall
            </Button>
          )}
        </div>

        {/* Content Area */}
        <Container className="relative z-20 flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="rounded-xl bg-gray-800/30 backdrop-blur-lg">
            {renderContent()}
          </div>
        </Container>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GameDetailsContent;
