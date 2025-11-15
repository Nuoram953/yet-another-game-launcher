import { GameActivityCharts } from "./components/Charts";
import { Stats } from "./components/Stats";

export const DetailsActivities = () => {
  return (
    <div className="flex flex-col gap-8">
      <Stats />
      <GameActivityCharts />
    </div>
  );
};
