import { StatsCard } from "@render/components/new/card/StatsCard";
import CalendarHeatmap from "./components/calendarHeatmap";
import { Calendar } from "lucide-react";
import ChartSessionTimeline from "./components/ChartSessionTimeline";
import ChartAMPMPlaytimeDistribution from "./components/chartAmPmDistribution";
import ChartSessionDurationDistribution from "./components/ChartSessionDistribution";
import { useSessionStats } from "./hooks/useSessionStats";
import { Table } from "@render/components/new/table/Table";
import useGameStore from "../detail/store/GameStore";
import Section from "@render/components/new/section";
import { ChartActivityOs } from "./components/chartActivityOs";

export const DetailsActivities = () => {
  const game = useGameStore((state) => state.game);
  const stats = useSessionStats();

  return (
    <>
      <div className="flex sm:flex-col sm:justify-around lg:flex-row lg:justify-around">
        <div className="flex flex-col justify-around sm:gap-16 lg:w-4/5 lg:gap-32">
          <ChartSessionTimeline />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <ChartActivityOs />
            <ChartAMPMPlaytimeDistribution />
            <ChartSessionDurationDistribution />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-row lg:flex-col lg:justify-start">
          <CalendarHeatmap />
          <div className="grid sm:grid-cols-2 lg:grid-cols-1">
            <StatsCard
              icon={Calendar}
              label="Longest Session"
              value={`${stats.longestSessionDuration.toFixed(0)} minutes`}
            />
            <StatsCard
              icon={Calendar}
              label="Average Session"
              value={`${stats.averageSessionDuration.toFixed(0)} minutes`}
            />
            <StatsCard icon={Calendar} label="Activity" value={`${stats.totalSessions} sessions`} />
            <StatsCard icon={Calendar} label="Most played day" value={stats.mostPlayedDay} />
          </div>
        </div>
        <div></div>
      </div>
      <div className="mt-32">
        <Section>
          <Section.Title title="All Sessions" />
          <Section.Content>
            <Table
              data={game?.activities || []}
              columns={[
                { accessorKey: "id", header: "ID" },
                { accessorKey: "startedAt", header: "Started At" },
                { accessorKey: "endedAt", header: "Ended At" },
                { accessorKey: "duration", header: "Duration (minutes)" },
              ]}
            />
          </Section.Content>
        </Section>
      </div>
    </>
  );
};
