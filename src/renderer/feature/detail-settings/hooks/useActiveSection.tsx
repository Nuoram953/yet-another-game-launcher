import React, { useState } from "react";
import { Blocks, Globe, Rocket, Settings } from "lucide-react";
import _ from "lodash";
import { LaunchStorefrontSettings } from "../components/LaunchStorefrontSettings";
import { CookieType, getCookie, setCookie } from "@render/utils/cookieUtil";
import { LaunchEmulatorSettings } from "../components/emulation/Settings";
import { LaunchAppSettings } from "../components/app/Settings";

export const useActiveSection = () => {
  const [activeCategory, setActiveCategory] = useState(
    (getCookie(CookieType.DETAILS_SETTINGS_ACTIVE_CATEGORY) as String) ?? "global",
  );
  const [activeSubcategory, setActiveSubcategory] = useState(
    getCookie(CookieType.DETAILS_SETTINGS_ACTIVE_SUBCATEGORY) ?? "detail",
  );

  const categories = {
    global: {
      title: "Global",
      icon: Globe,
      subcategories: {
        detail: { title: "Details", component: LaunchEmulatorSettings },
      },
    },
    launch: {
      title: "Launch",
      icon: Rocket,
      subcategories: {
        app: { title: "App", component: LaunchAppSettings },
        emulation: { title: "Emulation", component: LaunchEmulatorSettings },
        storefront: { title: "Storefront", component: LaunchStorefrontSettings },
      },
    },
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    setCookie(CookieType.DETAILS_SETTINGS_ACTIVE_CATEGORY, categoryKey, 30);
    const category = categories[categoryKey];

    if (category.subcategories && Object.keys(category.subcategories).length > 0) {
      const firstSubcategory = Object.keys(category.subcategories)[0];
      setActiveSubcategory(firstSubcategory);
      setCookie(CookieType.DETAILS_SETTINGS_ACTIVE_SUBCATEGORY, firstSubcategory, 30);
    } else {
      setActiveSubcategory(null);
    }
  };

  const getActiveComponent = () => {
    //@ts-ignore
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
    //@ts-ignore
    const category = categories[activeCategory];

    if (!category) return "launch";

    if (category.component) {
      return category.title;
    }

    if (category.subcategories && activeSubcategory) {
      return category.subcategories[activeSubcategory]?.title || category.title;
    }

    return category.title;
  };

  const getActivePlatform = () => {
    //@ts-ignore
    const category = categories[activeCategory];

    return category.subcategories[activeSubcategory]?.platformId;
  };

  return {
    ActiveComponent,
    activeCategory,
    activeSubcategory,
    categories,
    handleCategoryChange,
    getActiveTitle,
    setActiveSubcategory,
    getActivePlatform,
  };
};
