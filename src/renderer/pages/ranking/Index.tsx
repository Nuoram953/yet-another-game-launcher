import { Card } from "@render//components/card/Card";
import { Trophy, Clock, Edit, Trash2, Pencil, Plus } from "lucide-react";
import { useBreadcrumbsContext } from "@render//context/BreadcrumbsContext";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@render//components/ui/dialog";
import { Input } from "@render//components/ui/input";
import { Label } from "@render//components/ui/label";
import { RankingWithRelation } from "../../../common/types";
import { useNavigate } from "react-router-dom";
import { Image } from "@render//components/image/Image";
import { unixToDate } from "@render//utils/util";
import { Button } from "@render//components/button/Button";
import { Header } from "@render//components/layout/Header";
import { RankingGame } from "@prisma/client";

interface CoverImageProps {
  game: RankingGame;
  isFirst?: boolean;
}

const CoverImage = ({ game, isFirst = false }: CoverImageProps) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cover = await window.media.getCovers(game.gameId);
        setImage(cover[0]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div key={game.id} className={`relative mr-2 flex-shrink-0 ${isFirst ? "" : "self-end"}`}>
      <Image
        src={image}
        alt={String(game.id)}
        className={`rounded object-cover shadow-sm ${isFirst ? "h-48 w-32" : "h-36 w-24"}`}
      />
    </div>
  );
};

export const RankingPage = () => {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const [rankings, setRankings] = useState<RankingWithRelation[]>([]);
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

  const handleDelete = (id: number) => {
    setRankings(rankings.filter((ranking) => ranking.id !== id));
    window.ranking.delete(id);
  };

  const handleNewRanking = () => {
    setOpenNewDialog(true);
  };

  const handleEdit = (id: number) => {
    navigate(`/ranking/${id}`);
  };

  const handleSubmit = async () => {
    setOpenNewDialog(false);
    setRankings([...rankings, await window.ranking.create(name, maxItems)]);
  };

  return (
    <div className="flex h-screen flex-col text-white">
      <Header>
        <div className="m-4 flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold text-white"></h1>
          <Button
            intent={"primary"}
            onClick={handleNewRanking}
            text="Create"
            icon={Plus}
            size={"small"}
            className="w-fit"
          />
        </div>
      </Header>
      <div className="container mx-auto flex flex-col space-y-6 p-4">
        {rankings.map((ranking) => (
          <Card
            key={ranking.id}
            title={ranking.name}
            actions={[
              {
                icon: Edit,
                onClick: () => handleEdit(ranking.id),
                name: "Edit",
              },
              {
                icon: Trash2,
                onClick: () => handleDelete(ranking.id),
                name: "Delete",
              },
            ]}
            subtitle={
              <div className="flex items-center text-sm text-gray-500">
                {ranking.rankings.length > 0 && (
                  <>
                    <Trophy size={16} className="mr-1" />
                    <span className="mr-4">{ranking.rankings.filter((game) => game.rank !== null).length} games</span>
                  </>
                )}

                {ranking.rankings.length > 0 && (
                  <>
                    <Pencil size={16} className="mr-1" />
                    <span className="mr-4">{ranking.rankings.filter((game) => game.rank === null).length} games</span>
                  </>
                )}

                {ranking.updatedAt && (
                  <>
                    <Clock size={16} className="mr-1" />
                    <span>Updated {unixToDate(Number(ranking.updatedAt))}</span>
                  </>
                )}
              </div>
            }
          >
            <div>
              <div className="mt-4">
                <div className="hide-scrollbar flex items-end overflow-x-auto py-2">
                  {ranking.rankings
                    .filter((game) => game.rank !== null)
                    .map((game, index) => (
                      <CoverImage key={game.id} game={game} isFirst={index < 3} />
                    ))}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {rankings.length === 0 && (
          <div className="py-12 text-center">
            <p>No rankings found. Create your first ranking!</p>
          </div>
        )}
      </div>
      <Dialog open={openNewDialog}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpenNewDialog(false)}>
          <DialogHeader>
            <DialogTitle>New Ranking</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
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
