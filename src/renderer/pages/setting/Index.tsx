import React, { useEffect, useState } from "react";
import { Blocks, Globe, Settings } from "lucide-react";
import { SettingStoreSteam } from "./store/Steam";
import { SettingStoreEpic } from "./store/Epic";
import { useBreadcrumbsContext } from "@render/context/BreadcrumbsContext";
import { SettingExtensionYoutube } from "./extension/Youtube";
import { SettingExtensionSteamGridDb } from "./extension/SteamGridDb";
import { SettingExtensionIGDB } from "./extension/IGDB";
import { SettingExtensionHowLongToBeat } from "./extension/HowLongToBeat";
import { SettingExtensionOpenCritic } from "./extension/openCritic";
import { Container } from "@render/components/layout/Container";
import { SettingSidebar } from "./SettingSidebar";
import { SettingApperanceColors } from "./apperance/Colors";

export const SettingPage = () => {
  const [activeCategory, setActiveCategory] = useState("storefront");
  const [activeSubcategory, setActiveSubcategory] = useState("steam");
  const { setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    setBreadcrumbs([{ path: "/setting", label: "Settings" }]);
  }, []);

  const categories = {
    storefront: {
      title: "Storefront",
      icon: Globe,
      subcategories: {
        steam: { title: "Steam", component: SettingStoreSteam },
        epic: { title: "Epic", component: SettingStoreEpic },
      },
    },
    extensions: {
      title: "Extensions",
      icon: Blocks,
      subcategories: {
        youtube: { title: "Youtube", component: SettingExtensionYoutube },
        openCritic: { title: "Open Critic", component: SettingExtensionOpenCritic },
        howLongToBeat: { title: "How Long To Beat", component: SettingExtensionHowLongToBeat },
        steamGridDb: { title: "SteamGridDb", component: SettingExtensionSteamGridDb },
        igdb: { title: "IGDB", component: SettingExtensionIGDB },
      },
    },
    sidebar: {
      title: "Sidebar",
      icon: Settings,
      component: SettingSidebar,
    },
    appearance: {
      title: "Look & Feel",
      icon: Settings,
      subcategories: {
        colors: { title: "Colors", component: SettingApperanceColors },
      },
    },
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    const category = categories[categoryKey];

    if (category.subcategories && Object.keys(category.subcategories).length > 0) {
      const firstSubcategory = Object.keys(category.subcategories)[0];
      setActiveSubcategory(firstSubcategory);
    } else {
      setActiveSubcategory(null);
    }
  };

  const getActiveComponent = () => {
    const category = categories[activeCategory];

    if (!category) {
      return () => <div>Settings not found</div>;
    }

    if (category.component) {
      return category.component;
    }

    if (category.subcategories && activeSubcategory) {
      return category.subcategories[activeSubcategory]?.component || (() => <div>Settings not found</div>);
    }

    return () => <div>Settings not found</div>;
  };

  const ActiveComponent = getActiveComponent();

  const getActiveTitle = () => {
    const category = categories[activeCategory];

    if (!category) return "Settings";

    if (category.component) {
      return category.title;
    }

    if (category.subcategories && activeSubcategory) {
      return category.subcategories[activeSubcategory]?.title || category.title;
    }

    return category.title;
  };

  return (
    <div className="flex h-screen flex-col bg-design-background text-design-text-normal">
      <div className="mt-16 flex h-full">
        <div className="flex h-full w-72 flex-col border-r border-slate-700/50 bg-design-foreground backdrop-blur-sm">
          <div className="border-b border-slate-700/50 p-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                <Settings className="h-5 w-5 text-design-text-normal" />
              </div>
              <h1 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-semibold text-transparent">
                Settings
              </h1>
            </div>
          </div>

          <div className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent flex-1 overflow-y-auto">
            <div className="space-y-2 p-3">
              {Object.entries(categories).map(([key, category]) => {
                const IconComponent = category.icon;
                const hasSubcategories =
                  "subcategories" in category &&
                  category.subcategories &&
                  Object.keys(category.subcategories).length > 0;
                const isActive = activeCategory === key;

                return (
                  <div key={key} className="space-y-1">
                    <button
                      onClick={() => handleCategoryChange(key)}
                      className={`group flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                        isActive
                          ? "border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/10"
                          : "border border-transparent hover:border-slate-600/50 hover:bg-slate-700/50"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                            : "bg-slate-700/50 group-hover:bg-slate-600/50"
                        }`}
                      >
                        <IconComponent className="h-4 w-4 text-design-text-normal" />
                      </div>
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isActive ? "text-design-text-normal" : "group-hover:text-design-normal text-slate-300"
                        }`}
                      >
                        {category.title}
                      </span>
                    </button>

                    {isActive && hasSubcategories && (
                      <div className="ml-4 space-y-1 duration-200 animate-in slide-in-from-left-2">
                        {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                          <button
                            key={subKey}
                            onClick={() => setActiveSubcategory(subKey)}
                            className={`group w-full rounded-lg px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                              activeSubcategory === subKey
                                ? "border border-blue-500/30 bg-blue-500/20 font-medium text-blue-300"
                                : "border border-transparent text-slate-400 hover:bg-slate-700/30 hover:text-design-text-normal"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{subcategory.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Container>
          <div className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent h-full overflow-y-auto">
            <div className="mb-8">
              <div className="mb-2 flex items-center space-x-3">
                <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
                <h2 className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
                  {getActiveTitle()}
                </h2>
              </div>
              <p className="ml-5 text-lg text-slate-400">
                Manage your {getActiveTitle().toLowerCase()} settings and preferences
              </p>
            </div>

            <ActiveComponent />
          </div>
        </Container>
      </div>
    </div>
  );
};
