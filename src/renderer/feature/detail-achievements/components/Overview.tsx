import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { LOCALE_NAMESPACE } from "@common/constant";
import useGameStore from "@render/feature/detail/store/GameStore";
import { Card } from "@render/components/card/Card";
import { StatsCard } from "@render/feature/detail-overview/components/StatsCard";
import { Clock, Trophy } from "lucide-react";

ChartJS.register(ArcElement, Tooltip);

export const Overview = () => {
  const { t } = useTranslation();
  const { game } = useGameStore();

  const stats = useMemo(() => {
    if (!game?.achievements) return null;

    const total = game.achievements.length;
    const unlocked = game.achievements.filter((a) => a.isUnlocked).length;
    const hidden = game.achievements.filter((a) => a.isHidden).length;
    const rare = game.achievements.filter((a) => a.rarity && a.rarity < 10).length;
    const locked = total - unlocked;
    const completionPercentage = (unlocked / total) * 100;

    return { total, unlocked, locked, hidden, rare, completionPercentage };
  }, [game?.achievements]);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-design-text-subtle">
        <p>{t("achievements.overview.noData", { ns: LOCALE_NAMESPACE.DETAIL })}</p>
      </div>
    );
  }

  const colors = [
    { border: "rgb(34,197,94)", background: "rgba(34,197,94,0.2)" }, // unlocked green
    { border: "rgb(239,68,68)", background: "rgba(239,68,68,0.2)" }, // locked red
    { border: "rgb(148,163,184)", background: "rgba(148,163,184,0.2)" }, // hidden gray
    { border: "rgb(59,130,246)", background: "rgba(59,130,246,0.2)" }, // rare blue
  ];

  const data = {
    labels: ["Unlocked", "Locked", "Hidden", "Rare"],
    datasets: [
      {
        data: [stats.unlocked, stats.locked],
        borderColor: colors.map((c) => c.border),
        backgroundColor: colors.map((c) => c.background),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const label = context.label;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div>
      {/* Stats row just like Timeline */}
      <div className="flex h-full w-full items-center justify-between gap-4">
        <StatsCard icon={Trophy} label="Total Achievements" value={String(stats.total)} />

        <StatsCard icon={Trophy} label="Unlocked" value={String(stats.unlocked)} />

        <StatsCard icon={Trophy} label="Completion" value={String(stats.completionPercentage.toFixed(0)) + "%"} />
      </div>

      {/* Chart */}
      <div className="h-80 rounded-lg p-4">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};
