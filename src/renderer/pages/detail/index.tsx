import React, { useEffect, useState } from "react";
import {
  Play,
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
  Award,
  PictureInPicture,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Game } from "@prisma/client";
import { useParams } from "react-router-dom";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Background } from "./Background";
import { Logo } from "./Logo";
import { Trailer } from "./Trailer";
import { convertToHoursAndMinutes } from "@/utils/util";
import { useGames } from "@/context/DatabaseContext";
import { StatsPanel } from "./StatsPanel";
import { SectionMetadata } from "./SectionMetadata";

const GameDetailsContent = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const { selectedGame, updateSelectedGame } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await window.database.getGame(id);
        if (result) {
          console.log(result);
          await updateSelectedGame(result);
          setLoading(false);
        }

        setBreadcrumbs([
          { path: "/", label: "Library" },
          { path: `/${result.id}`, label: result.name },
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

  const handleOnClick = async () => {
    await window.steam.launch(selectedGame.externalId);
  };

  // Define sections array that was missing
  const sections = [
    { id: "overview", icon: BookOpen, label: "Overview" },
    { id: "achievements", icon: Trophy, label: "Achievements" },
    { id: "activities", icon: Activity, label: "Activities" },
    { id: "notes", icon: PenLine, label: "Notes" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "playtime", icon: Clock, label: "Playtime" },
    { id: "multiplayer", icon: Users, label: "Multiplayer" },
    { id: "updates", icon: Download, label: "Updates" },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "community", icon: MessageSquare, label: "Community" },
    { id: "metadata", icon: Image, label: "Metadata" },
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const StatCard = ({ icon: Icon, label, value, detail }) => (
    <div className="bg-gray-800 flex-grow flex-1 rounded-lg p-4 transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 mr-2 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold">{value}</span>
        {detail && <span className="text-sm text-gray-400">{detail}</span>}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-800 rounded-lg"></div>
          <div className="h-32 bg-gray-800 rounded-lg"></div>
          <div className="h-24 bg-gray-800 rounded-lg"></div>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6 animate-fadeIn">
            <StatsPanel />
            <Trailer />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Release Date", "Developer", "Publisher", "Genre"].map(
                (label, index) => (
                  <div
                    key={label}
                    className="bg-gray-800 p-4 rounded-lg transform hover:scale-105 transition-all duration-300"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "slideUp 0.5s ease-out forwards",
                    }}
                  >
                    <h3 className="text-gray-400 text-sm">{label}</h3>
                    {selectedGame.developers.map((dev) => (
                      <p>{dev.company.name}</p>
                    ))}
                  </div>
                ),
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg transform hover:bg-gray-750 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-300">desc</p>
            </div>
          </div>
        );
      case "metadata":
        return <SectionMetadata />;
      default:
        return (
          <div className="bg-gray-800 p-6 rounded-lg animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="text-gray-400">Content for {activeSection} section</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Background>
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <Logo />
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-500 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
            onClick={handleOnClick}
          >
            <Play className="mr-2 h-5 w-5 animate-pulse" />
            Play Now
          </Button>
        </div>
      </Background>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Secondary Navigation */}
        <div className="w-48 bg-gray-800 p-2 overflow-y-auto">
          {sections.map((section, index) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1 transform hover:translate-x-1 transition-transform duration-200"
              onClick={() => handleSectionChange(section.id)}
              style={{
                animation: "slideIn 0.5s ease-out forwards",
                animationDelay: `${index * 50}ms`,
              }}
            >
              <section.icon
                className={`h-4 w-4 mr-2 ${activeSection === section.id ? "animate-bounce" : ""}`}
              />
              {section.label}
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 overflow-y-auto">{renderContent()}</div>
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
