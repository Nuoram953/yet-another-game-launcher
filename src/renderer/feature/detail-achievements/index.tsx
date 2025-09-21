import { Overview } from "./components/Overview";
import Timeline from "./components/Timeline";
import { Listv2 } from "./components/Listv2";
import Section from "@render/components/new/section";

export const DetailsAchievements = () => {
  return (
    <div className="mx-auto flex flex-col justify-center gap-16">
      <div className="mx-auto grid w-full grid-cols-1 items-center justify-center gap-8 lg:grid-cols-2">
        <Section>
          <Section.Title title="Total Unlocked" />
          <Section.Content>
            <Overview />
          </Section.Content>
        </Section>

        <Section>
          <Section.Title title="Timeline" />
          <Section.Content>
            <Timeline />
          </Section.Content>
        </Section>
      </div>

      <Section>
        <Section.Title title="All Achievements" />
        <Section.Content>
          <Listv2 />
        </Section.Content>
      </Section>
    </div>
  );
};
