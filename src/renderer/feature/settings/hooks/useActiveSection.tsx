import React, { useState } from "react";
import { Blocks, Globe, Settings } from "lucide-react";
import { SettingStoreSteam } from "../components/store/Steam";
import { SettingStoreEpic } from "../components/store/Epic";
import { SettingExtensionYoutube } from "../components/extension/Youtube";
import { SettingExtensionSteamGridDb } from "../components/extension/SteamGridDb";
import { SettingExtensionIGDB } from "../components/extension/IGDB";
import { SettingExtensionHowLongToBeat } from "../components/extension/HowLongToBeat";
import { SettingExtensionOpenCritic } from "../components/extension/openCritic";
import { SettingSidebar as SettingComponents } from "../components/components/SettingSidebar";
import { SettingApperanceColors } from "../components/apperance/Colors";
import { SettingPageGameDetails } from "../components/page/SettingPageDetail";

export const useActiveSection = () => {
  const [activeCategory, setActiveCategory] = useState("storefront");
  const [activeSubcategory, setActiveSubcategory] = useState("steam");

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
      title: "Components",
      icon: Settings,
      component: SettingComponents,
      subcategories: {
        sidebar: { title: "Sidebar", component: SettingComponents },
      },
    },
    appearance: {
      title: "Look & Feel",
      icon: Settings,
      subcategories: {
        colors: { title: "Colors", component: SettingApperanceColors },
      },
    },
    page: {
      title: "Pages",
      icon: Settings,
      subcategories: {
        colors: { title: "Game's details", component: SettingPageGameDetails },
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

  return {
    ActiveComponent,
    activeCategory,
    activeSubcategory,
    categories,
    handleCategoryChange,
    getActiveTitle,
    setActiveSubcategory,
  };
};
