import React, { useEffect, useState } from "react";
import { Input } from "@render/components/ui/input";
import { Label } from "@render/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@render/components/ui/sheet";
import { Filter, XIcon } from "lucide-react";
import { Button } from "@render/components/button/Button";
import { useGames } from "@render/context/DatabaseContext";
import { Company, GameStatus, Tag, Storefront } from "@prisma/client";
import { Select } from "@render/components/input/Select";
import { Checkbox } from "@render/components/input/Checkbox";

export function FilterSheet() {
  const [loading, setLoading] = useState(true);
  const { updateFilters, filters } = useGames();
  const [filtersData, setFiltersData] = useState<{
    companies: Company[];
    tags: Tag[];
    status: GameStatus[];
    storefronts: Storefront[];
  }>({
    companies: [],
    tags: [],
    status: [],
    storefronts: [],
  });

  const [developpers, setDeveloppers] = useState(filters.developpers || []);
  const [publishers, setPublishers] = useState(filters.publishers || []);
  const [tags, setTags] = useState(filters.tags || []);
  const [storefronts, setStorefronts] = useState(filters.storefronts || []);
  const [status, setStatus] = useState(filters.status || []);
  const [installed, setInstalled] = useState(filters.isInstalled || false);
  const [favorite, setFavorite] = useState(filters.isFavorite || false);
  const [timePlayed, setTimePlayed] = useState(filters.timePlayed || []);
  const [mainStory, setMainStory] = useState(filters.mainStory || []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.library.getFilters();
        setFiltersData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    updateFilters({
      developpers,
      publishers,
      tags,
      status,
      isInstalled: installed,
      isFavorite: favorite,
      storefronts,
      timePlayed,
      mainStory,
    });
  };

  return (
    <>
      <Sheet key={"button"}>
        <SheetTrigger asChild>
          <Button intent={"icon"} icon={Filter} size={"fit"} />
        </SheetTrigger>
        <SheetContent side={"right"} color="#1e293b">
          <SheetHeader>
            <SheetTitle>Edit filters</SheetTitle>
            <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            <Checkbox label="Installed" checked={installed} setValue={setInstalled} />
            <Checkbox label="Favorite" checked={favorite} setValue={setFavorite} />

            <Select
              label="Status"
              options={filtersData.status.map((status) => ({
                value: String(status.id),
                label: status.name,
              }))}
              onChange={(choice) => {
                setStatus([...choice]);
              }}
              values={status}
            />
            <Select
              label="Developer"
              options={filtersData.companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
              onChange={(choice) => {
                setDeveloppers([...choice]);
              }}
              values={developpers}
            />
            <Select
              label="Publisher"
              options={filtersData.companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
              onChange={(choice) => {
                setPublishers([...choice]);
              }}
              values={publishers}
            />
            <Select
              label="Tag"
              options={filtersData.tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }))}
              onChange={(choice) => {
                setTags([...choice]);
              }}
              values={tags}
            />

            <Select
              label="Storefront"
              allowCustomValues={true}
              options={filtersData.storefronts.map((store) => ({
                value: String(store.id),
                label: store.name,
              }))}
              onChange={(choice) => {
                setStorefronts([...choice]);
              }}
              values={storefronts}
            />

            <Select
              label="Time played"
              options={[
                {
                  value: "0",
                  label: "Never",
                },
                {
                  value: "<1",
                  label: "<1 hour",
                },
                {
                  value: "<5",
                  label: "<5 hours",
                },
                {
                  value: "<10",
                  label: "<10 hours",
                },
                {
                  value: "<25",
                  label: "<25 hours",
                },
                {
                  value: "<50",
                  label: "<50 hours",
                },
                {
                  value: ">100",
                  label: ">100 hours",
                },
              ]}
              onChange={(choice) => {
                setTimePlayed([...choice]);
              }}
              values={timePlayed}
            />

            <Select
              label="How long to beat"
              options={[
                {
                  value: "<5",
                  label: "<5 hours",
                },
                {
                  value: "<10",
                  label: "<10 hours",
                },
                {
                  value: "<25",
                  label: "<25 hours",
                },
                {
                  value: "<50",
                  label: "<50 hours",
                },
                {
                  value: ">100",
                  label: ">100 hours",
                },
              ]}
              onChange={(choice) => {
                setMainStory([...choice]);
              }}
              values={mainStory}
            />

            <Select
              label="Date added"
              options={filtersData.storefronts.map((store) => ({
                value: String(store.id),
                label: store.name,
              }))}
              onChange={(choice) => {
                setStorefronts([...choice]);
              }}
              values={storefronts}
            />
            <Select
              label="Last time played"
              options={[
                {
                  value: "year",
                  label: "This year",
                },
                {
                  value: "today",
                  label: "Today",
                },
                {
                  value: "week",
                  label: "This week",
                },
                {
                  value: "month",
                  label: "This month",
                },
              ]}
              onChange={(choice) => {
                setStorefronts([...choice]);
              }}
              values={storefronts}
            />
          </div>

          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button type="submit" intent={"primary"} text="save" onClick={handleSave} />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
