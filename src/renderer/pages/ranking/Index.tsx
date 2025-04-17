import { Card } from "@/components/card/Card";
import {
  Heart,
  Trophy,
  Eye,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RankingWithRelation } from "../../../common/types";
import { useNavigate } from "react-router-dom";

export const RankingPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const [rankings, setRankings] = useState<RankingWithRelation[]>([]);
  const [selectedRanking, setSelectedRanking] = useState<number | null>(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);

  const [name, setName] = useState("");
  const [maxItems, setMaxItems] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumbs([
      { path: "/", label: "Home" },
      { path: "/ranking", label: "Ranking" },
    ]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankings = await window.ranking.getAll();
        setRankings(rankings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = (id) => {
    setRankings(rankings.filter((ranking) => ranking.id !== id));
    window.ranking.delete(id);
    if (selectedRanking?.id === id) {
      setSelectedRanking(null);
    }
  };

  const handleNewRanking = () => {
    setOpenNewDialog(true);
  };

  const handleEdit = (id) => {
    navigate(`/ranking/${id}`);
  };

  const handleSubmit = async () => {
    setOpenNewDialog(false);
    setRankings([...rankings,await window.ranking.create(name, maxItems)]);
  };

  return (
    <div className="flex h-screen flex-col text-white">
      <div className="container mx-auto flex flex-col space-y-6 p-4">
        {rankings.map((ranking) => (
          <Card key={ranking.id} title={ranking.name}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center"></div>

                  <div className="flex items-center text-sm">
                    <Trophy size={16} className="mr-1" />
                    <span className="mr-4 text-white">
                      {ranking.rankings.length} games
                    </span>

                    <Clock size={16} className="mr-1" />
                    <span className="text-white">
                      Updated {Number(ranking.updatedAt)}
                    </span>

                    <span
                      className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${ranking.rankingStatusId === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {ranking.rankingStatusId}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="rounded-full p-2 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(ranking.id)}>
                    <Edit size={18} />
                  </button>
                  <button
                    className="rounded-full p-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(ranking.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="rounded-full p-2 hover:bg-gray-100"
                    onClick={() => setSelectedRanking(ranking.id === selectedRanking ? null : ranking.id)}
                  >
                    <ChevronRight
                      size={18}
                      className={`transform transition-transform ${selectedRanking === ranking.id ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Game covers preview */}
              <div className="mt-4">
                <div className="hide-scrollbar flex overflow-x-auto py-2">
                  {ranking.rankings.map((game) => (
                    <div key={game.id} className="relative mr-2 flex-shrink-0">
                      <img
                        src={"imgae/url/game"}
                        alt={game.gameId}
                        className="h-24 w-16 rounded object-cover shadow-sm"
                        title={game.gameId}
                      />
                    </div>
                  ))}
                  {/* {ranking.rankings.length > ranking.games.length && ( */}
                  {/*   <div className="flex h-24 w-16 items-center justify-center rounded bg-gray-100 text-xs font-medium"> */}
                  {/*     +{ranking.totalGames - ranking.games.length} more */}
                  {/*   </div> */}
                  {/* )} */}
                </div>
              </div>

              {/* Expanded details */}
              {selectedRanking === ranking.id && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="mb-2 font-semibold">Full Game List</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {ranking.rankings.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center space-x-2"
                      >
                        <img
                          src={"test"}
                          alt={"test"}
                          className="h-12 w-8 rounded object-cover"
                        />
                        <span className="text-sm">{game.gameId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}

        {rankings.length === 0 && (
          <div className="py-12 text-center">
            <p>No rankings found. Create your first ranking!</p>
          </div>
        )}

        <button
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
          onClick={handleNewRanking}
        >
          Create New Ranking
        </button>
      </div>
      <Dialog open={openNewDialog}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={() => setOpenNewDialog(false)}
        >
          <DialogHeader>
            <DialogTitle>New Ranking</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Max items
              </Label>
              <Input
                type="number"
                min={3}
                id="username"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
