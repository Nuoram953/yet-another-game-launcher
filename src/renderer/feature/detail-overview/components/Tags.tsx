import { motion } from "framer-motion";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useGameFromParams } from "@render/hooks/useGameParam";

export const Tags = () => {
  const { game, isLoading } = useGameFromParams();

  if (isLoading) {
    return <LoadingCenter />;
  }

  const allTags = game?.tags?.map((t: any) => t.tag.name) ?? [];

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {allTags.map((tag: string, idx: number) => (
        <motion.span
          key={tag}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="bg-design-accent/20 hover:bg-design-accent/30 text-design-white cursor-pointer rounded-full border border-white px-2 py-1 text-xs transition"
        >
          {tag}
        </motion.span>
      ))}
    </div>
  );
};
