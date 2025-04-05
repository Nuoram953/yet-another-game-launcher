import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import GameScopeSettings from "./GamescopeSettings";
import { Tile } from "../Tile";
import { TabInfo } from "./TabInfo";

enum Tabs {
  INFO = "Info",
  LAUNCH = "Launch",
  UTILITY = "Utility",
}

export const SectionSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.INFO);

  const handleTabClick = (tabId: Tabs) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchBackgroundPicture();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-300">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === Tabs.INFO
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-white hover:text-gray-700"
          }`}
          onClick={() => handleTabClick(Tabs.INFO)}
        >
          {Tabs.INFO}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === Tabs.LAUNCH
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-white hover:text-gray-700"
          }`}
          onClick={() => handleTabClick(Tabs.LAUNCH)}
        >
          {Tabs.LAUNCH}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === Tabs.UTILITY
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-white hover:text-gray-700"
          }`}
          onClick={() => handleTabClick(Tabs.UTILITY)}
        >
          {Tabs.UTILITY}
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === Tabs.INFO && (
          <TabInfo/>
        )}

        {activeTab === Tabs.LAUNCH && (
          <div>
            <h2 className="mb-2 text-xl font-bold">Tab 2 Content</h2>
            <p>
              This is the content for Tab 2. Each tab can contain different
              content.
            </p>
          </div>
        )}

        {activeTab === Tabs.UTILITY && (
          <div>
            <h2 className="mb-2 text-xl font-bold">Tab 3 Content</h2>
            <p>
              This is the content for Tab 3. Replace this with your actual
              content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
