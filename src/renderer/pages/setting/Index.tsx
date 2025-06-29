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
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    const firstSubcategory = Object.keys(categories[categoryKey].subcategories)[0];
    setActiveSubcategory(firstSubcategory);
  };

  const ActiveComponent =
    categories[activeCategory]?.subcategories[activeSubcategory]?.component || (() => <div>Settings not found</div>);

  return (
    <div className="flex h-screen flex-col text-white">
      <div className="flex h-full">
        <div className="flex h-full w-64 flex-col dark:bg-slate-800">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-white" />
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Object.entries(categories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <div key={key} className="">
                  <button
                    onClick={() => handleCategoryChange(key)}
                    className={`flex w-full items-center space-x-3 px-6 py-4 text-left transition-colors hover:opacity-50 ${
                      activeCategory === key ? "border-r-2 border-blue-600 bg-slate-700" : ""
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 text-white`} />
                    <span className={`font-medium`}>{category.title}</span>
                  </button>

                  {activeCategory === key && (
                    <div className="bg-slate-600">
                      {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                        <button
                          key={subKey}
                          onClick={() => setActiveSubcategory(subKey)}
                          className={`w-full px-12 py-3 text-left text-sm transition-colors hover:opacity-50 ${
                            activeSubcategory === subKey ? "font-medium text-blue-600" : "text-white"
                          }`}
                        >
                          {subcategory.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Container>
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {categories[activeCategory]?.subcategories[activeSubcategory]?.title}
              </h2>
              <p className="mt-1 text-gray-600">
                Manage your {categories[activeCategory]?.subcategories[activeSubcategory]?.title.toLowerCase()} settings
              </p>
            </div>

            <ActiveComponent />
          </div>
        </Container>
      </div>
    </div>
  );
};
