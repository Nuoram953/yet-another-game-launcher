import { useState } from "react";

export type Section = "overview" | "achievements" | "reviews" | "activities" | "metadata" | "settings";

export const useActiveSection = (initialSection: Section = "overview") => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  const isActive = (section: Section) => activeSection === section;

  return {
    activeSection,
    setActiveSection,
    isActive,
  };
};
