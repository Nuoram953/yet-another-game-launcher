import React from "react";
import { Trailer } from "./components/Trailer";
import { useActiveSection } from "./hooks/useActiveSection";
import { DetailsAchievements } from "../detail-achievements";
import { DetailsOverview } from "../detail-overview";
import { DetailsReviews } from "../detail-reviews";
import _ from "lodash";
import { DetailsMetadata } from "../detail-metadata";
import { DetailsSettings } from "../detail-settings";
import { Nav } from "./components/Nav";
import { DetailsActivities } from "../detail-activities";

export const DetailPage = () => {
  const { activeSection, setActiveSection } = useActiveSection();

  return (
    <div className="mx-auto h-screen max-w-[1920px] overflow-y-auto overflow-x-hidden">
      <Trailer />
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="w-full">
        <div className="z-10 m-4">
          {activeSection === "overview" && <DetailsOverview />}
          {activeSection === "achievements" && <DetailsAchievements />}
          {activeSection === "activities" && <DetailsActivities />}
          {activeSection === "reviews" && <DetailsReviews />}
          {activeSection === "metadata" && <DetailsMetadata />}
          {activeSection === "settings" && <DetailsSettings />}
        </div>
      </div>
    </div>
  );
};
