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
import Select from "react-select";
import { useGames } from "@render/context/DatabaseContext";
import { Company, GameStatus, Tag } from "@prisma/client";

const darkTheme = {
  borderRadius: 4,
  colors: {
    primary25: "#333",
    primary: "#555",
    neutral0: "#222", // background
    neutral5: "#2a2a2a",
    neutral10: "#444",
    neutral20: "#666", // border
    neutral30: "#888",
    neutral80: "#eee", // text
  },
};

const darkStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#222",
    borderColor: "#666",
    color: "#eee",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#222",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#333" : "#222",
    color: "#eee",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#eee",
  }),
  input: (provided) => ({
    ...provided,
    color: "#eee",
  }),
};

export function FilterSheet() {
  const [loading, setLoading] = useState(true);
  const { updateFilters, filters } = useGames();
  const [filtersData, setFiltersData] = useState<{
    companies: Company[];
    tags: Tag[];
    status: GameStatus[];
  }>({
    companies: [],
    tags: [],
    status: [],
  });

  const [developpers, setDeveloppers] = useState(filters.developpers || []);

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
    updateFilters({ developpers: developpers });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet key={"button"}>
        <SheetTrigger asChild>
          <Button intent={"icon"} icon={Filter} size={"fit"} />
        </SheetTrigger>
        <SheetContent side={"right"}>
          <SheetHeader>
            <SheetTitle>Edit filters</SheetTitle>
            <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-left">
                Developer
              </Label>
              <Select
                isMulti
                theme={(theme) => ({ ...theme, ...darkTheme })}
                styles={darkStyles}
                name="colors"
                options={filtersData.companies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                className="basic-multi-select z-9999 dark"
                classNamePrefix="select"
                onChange={(choice) => {
                  setDeveloppers([...choice]);
                }}
                value={developpers}
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" intent={"primary"} text="save" onClick={handleSave} />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
