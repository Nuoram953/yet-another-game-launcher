import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import useGameStore from "@render/feature/detail/store/GameStore";

export const Tags = () => {
  const game = useGameStore((state) => state.game);

  const sections = [
    {
      title: "A game that is ...",
      filter: (t: any) => t.isGenre,
      icon: "🎮",
    },
    {
      title: "Experiences as ...",
      filter: (t: any) => t.isGameMode,
      icon: "👥",
    },
    {
      title: "Themes",
      filter: (t: any) => t.isTheme,
      icon: "🎭",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      {sections.map(({ title, filter, icon }) => (
        <div key={title} className="bg-design-dark flex flex-col items-center rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-design-white">
            <span>{icon}</span> {title}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {game?.tags?.filter(filter).map((tag: any, idx: number) => (
              <motion.span
                key={tag.tag.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-design-accent/20 hover:bg-design-accent/30 cursor-pointer rounded-full border border-white px-3 py-1 text-sm text-design-white transition"
              >
                {tag.tag.name}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
