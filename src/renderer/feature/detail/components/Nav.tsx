import { Navbar } from "@render/components/new/navbar";
import { Section } from "../hooks/useActiveSection";
import { ChartNoAxesGantt, Clock, Pencil, Settings, Trophy, Image } from "lucide-react";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { Dispatch, SetStateAction } from "react";

type NavProps = {
  activeSection: Section;
  setActiveSection: Dispatch<SetStateAction<Section>>;
};

export const Nav = ({ activeSection, setActiveSection }: NavProps) => {
  const { game, isLoading } = useGameFromParams();

  if (isLoading) {
    return <LoadingCenter />;
  }

  return (
    <Navbar>
      <Navbar.Section>
        <Navbar.Item
          onClick={() => setActiveSection("overview")}
          icon={<ChartNoAxesGantt />}
          active={activeSection === "overview"}
          text="Overview"
        />
        <Navbar.Item
          icon={<Trophy />}
          onClick={() => setActiveSection("achievements")}
          disabled={game.achievements.length === 0}
          active={activeSection === "achievements"}
          text="Achievements"
        />
        <Navbar.Item
          icon={<Clock />}
          onClick={() => setActiveSection("activities")}
          disabled={game.activities.length === 0}
          active={activeSection === "activities"}
          text="Activities"
        />
        <Navbar.Item
          icon={<Pencil />}
          onClick={() => setActiveSection("reviews")}
          active={activeSection === "reviews"}
          text="Reviews"
        />
        <Navbar.Item
          icon={<Image />}
          onClick={() => setActiveSection("metadata")}
          active={activeSection === "metadata"}
          text="Media"
        />
        <Navbar.Item
          icon={<Settings />}
          onClick={() => setActiveSection("settings")}
          active={activeSection === "settings"}
          text="Settings"
        />
      </Navbar.Section>
    </Navbar>
  );
};
