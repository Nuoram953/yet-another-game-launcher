import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useRankings } from "../api/get-rankings";
import { motion } from "framer-motion";
import { Toolbar } from "@render/components/new/toolbar";
import { useNavigate } from "@tanstack/react-router";
import { CreateRanking } from "./create-ranking";
import { Badge } from "@render/components/new/badge/Badge";

export const RankingsList = () => {
  const navigate = useNavigate();
  const rankingsQuery = useRankings({});

  if (rankingsQuery.isPending) return <LoadingCenter />;

  const rankings = rankingsQuery.data ?? [];

  return (
    <>
      <Toolbar>
        <div></div>
        <CreateRanking />
      </Toolbar>
      <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {rankings.map((ranking) => (
          <motion.div
            key={ranking.id}
            whileHover={{ scale: 1.02 }}
            className="flex cursor-pointer gap-4 rounded-2xl border border-normal bg-foreground p-4 shadow-lg"
            onClick={() => {
              navigate({
                to: "/ranking/$id",
                params: { id: ranking.id.toString() },
              });
            }}
          >
            <div className="relative h-40 w-40 shrink-0">
              {ranking.games.slice(0, 3).map((game, index) => (
                <img
                  key={game.id}
                  src={game.cover[0]}
                  alt={game.name}
                  className="absolute h-40 w-28 rounded-xl object-cover shadow-lg"
                  style={{
                    left: `${index * 30}px`,
                    top: `${index * 6}px`,
                    zIndex: 10 - index,
                    transform: `scale(${1 - index * 0.06})`,
                    opacity: 1 - index * 0.15,
                  }}
                />
              ))}
            </div>

            <div className="flex w-full flex-col justify-between px-4 py-2">
              <div>
                <h3 className="text-lg font-semibold leading-tight text-normal">{ranking.name}</h3>

                {ranking.description && <p className="mt-1 line-clamp-2 text-sm text-subtle">{ranking.description}</p>}
              </div>

              <div className="mb-1 flex flex-wrap gap-2">
                {ranking.tags?.map((tag) => (
                  <Badge
                    text={tag}
                    key={tag}
                    className="inline-block rounded-md px-2 py-0.5 text-xs font-medium text-normal"
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-8 text-xs text-subtle">
                <span>{ranking.games.length} games</span>
                <span>{ranking.creationDate}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};
