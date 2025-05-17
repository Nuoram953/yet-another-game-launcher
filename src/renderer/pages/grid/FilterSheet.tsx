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
    updateFilters({ developpers, publishers, tags, status, isInstalled: installed, isFavorite: favorite, storefronts });
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
              options={filtersData.storefronts.map((store) => ({
                value: String(store.id),
                label: store.name,
              }))}
              onChange={(choice) => {
                setStorefronts([...choice]);
              }}
              values={storefronts}
            />
            <TimePlayedFilter />
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

const TimePlayedFilter = () => {
  const [timePlayed, setTimePlayed] = useState([]);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState([0, 100]);

  // Predefined time options
  const timeOptions = [
    { value: "lt1", label: "< 1h" },
    { value: "lt10", label: "< 10h" },
    { value: "lt50", label: "< 50h" },
    { value: "gt100", label: "≥ 100h" },
    { value: "custom", label: "Custom Range..." },
  ];

  const handleTimeChange = (choice) => {
    // Check if "Custom Range" is selected
    if (choice.some((option) => option.value === "custom")) {
      setIsCustomOpen(true);
      // Filter out any predefined options if custom is selected
      const filteredChoices = choice.filter((option) => option.value !== "custom");
      setTimePlayed([
        ...filteredChoices,
        { value: `${customRange[0]}-${customRange[1]}`, label: `${customRange[0]}h - ${customRange[1]}h` },
      ]);
    } else {
      setIsCustomOpen(false);
      setTimePlayed([...choice]);
    }
  };

  const handleRangeChange = (e, index) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...customRange];
    newRange[index] = newValue;

    // Ensure min <= max
    if (index === 0 && newValue > customRange[1]) {
      newRange[1] = newValue;
    } else if (index === 1 && newValue < customRange[0]) {
      newRange[0] = newValue;
    }

    setCustomRange(newRange);

    // Update the time played with the new custom range
    const customOption = { value: `${newRange[0]}-${newRange[1]}`, label: `${newRange[0]}h - ${newRange[1]}h` };

    // Replace the existing custom option if it exists
    const customIndex = timePlayed.findIndex((option) => option.value.includes("-"));
    if (customIndex >= 0) {
      const updatedTimePlayed = [...timePlayed];
      updatedTimePlayed[customIndex] = customOption;
      setTimePlayed(updatedTimePlayed);
    } else {
      setTimePlayed([...timePlayed, customOption]);
    }
  };

  return (
    <div className="w-full text-gray-200">
      <Select
        label="Time Played"
        options={timeOptions}
        onChange={(choice) => handleTimeChange(choice)}
        values={timePlayed}
      />

      {isCustomOpen && (
        <div className="mt-2 rounded-md border border-gray-700 bg-gray-800 p-3">
          <div className="mb-2 flex justify-between">
            <span>Custom Range:</span>
            <span>
              {customRange[0]}h - {customRange[1]}h
            </span>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-300">Minimum Hours</label>
            <input
              type="range"
              min="0"
              max="500"
              value={customRange[0]}
              onChange={(e) => handleRangeChange(e, 0)}
              className="w-full accent-blue-500"
            />
            <input
              type="number"
              min="0"
              max="500"
              value={customRange[0]}
              onChange={(e) => handleRangeChange(e, 0)}
              className="mt-1 w-20 rounded border border-gray-600 bg-gray-700 p-1 text-gray-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Maximum Hours</label>
            <input
              type="range"
              min="0"
              max="500"
              value={customRange[1]}
              onChange={(e) => handleRangeChange(e, 1)}
              className="w-full accent-blue-500"
            />
            <input
              type="number"
              min="0"
              max="500"
              value={customRange[1]}
              onChange={(e) => handleRangeChange(e, 1)}
              className="mt-1 w-20 rounded border border-gray-600 bg-gray-700 p-1 text-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
