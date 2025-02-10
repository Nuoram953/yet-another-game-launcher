import React, { useEffect, useState } from "react";
import {
  Trophy,
  Activity,
  PenLine,
  Star,
  Clock,
  Users,
  BookOpen,
  Download,
  Settings,
  MessageSquare,
  Image,
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
import { SectionSettings } from "./SectionSettings";
import { SectionReview } from "./SectionReview";
import { SectionActivities } from "./SectionActivities";

const GameDetailsContent = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const { selectedGame, updateSelectedGame, running } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await window.library.getGame(id!);
        if (result) {
          await updateSelectedGame(result);
          setLoading(false);
        }

        setBreadcrumbs([
          { path: "/", label: "Library" },
          { path: `/game/${result.id}`, label: result.name },
        ]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  if (loading || !selectedGame) {
    return <div>...</div>;
  }

  const sections = [
    {
      id: "session",
      icon: BookOpen,
      label: "Active session",
      show: running.map((item) => item.id).includes(selectedGame.id),
    },
    { id: "overview", icon: BookOpen, label: "Overview", show: true },
    {
      id: "achievements",
      icon: Trophy,
      label: "Achievements",
      show: selectedGame.achievements.length,
    },
    { id: "activities", icon: Activity, label: "Activities", show: true },
    { id: "notes", icon: PenLine, label: "Notes", show: true },
    { id: "reviews", icon: Star, label: "Reviews", show: true },
    { id: "community", icon: MessageSquare, label: "Community", show: true },
    { id: "metadata", icon: Image, label: "Metadata", show: true },
    { id: "settings", icon: Settings, label: "Settings", show: true },
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-64 rounded-lg bg-gray-800"></div>
          <div className="h-32 rounded-lg bg-gray-800"></div>
          <div className="h-24 rounded-lg bg-gray-800"></div>
        </div>
      );
    }

    switch (activeSection) {
      case "session":
        return <SectionSession />;
      case "overview":
        return <SectionOverview />;
      case "metadata":
        return <SectionMetadata />;
      case "achievements":
        return <SectionAchievements />;
      case "settings":
        return <SectionSettings />;
      case "reviews":
        return <SectionReview />;
      case "activities":
        return <SectionActivities />;
      default:
        return (
          <div className="animate-fadeIn rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-bold">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="text-gray-400">Content for {activeSection} section</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      <Background>
        <div className="flex gap-8 w-1/2 flex-col items-center justify-center">
          <Logo />
          <ButtonPlay />
        </div>
      </Background>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 overflow-y-auto bg-gray-800 p-2">
          {sections
            .filter((section) => section.show)
            .map((section, index) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="mb-1 w-full transform justify-start transition-transform duration-200 hover:translate-x-1"
                onClick={() => handleSectionChange(section.id)}
                style={{
                  animation: "slideIn 0.5s ease-out forwards",
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <section.icon
                  className={`mr-2 h-4 w-4 ${activeSection === section.id ? "animate-bounce" : ""}`}
                />
                {section.label}
              </Button>
            ))}
        </div>

        {/* Content Area */}
        <div className="mx-auto max-w-[1500px] flex-1 overflow-y-auto px-6">
          {renderContent()}
        </div>
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
