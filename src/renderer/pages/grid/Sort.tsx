import { Button } from "@/components/button/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGames } from "@/context/DatabaseContext";
import { Game } from "@prisma/client";
import _ from "lodash";
import { ArrowDown, ArrowDownUp, ArrowUp, ArrowUpDown, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SortConfig } from "src/common/types";

export const Sort = () => {
  const { sortConfig, updateSort } = useGames();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [direction, setDirection] = useState<"asc" | "desc">(
    sortConfig.direction,
  );
  const [selected, setSelected] =
    useState<Omit<SortConfig, "direction">>(sortConfig);

  const options: {
    field: keyof Game;
    label: string;
  }[] = [
    {
      field: "lastTimePlayed",
      label: "Last played",
    },
    {
      field: "name",
      label: "Name",
    },
    {
      field: "timePlayed",
      label: "Time played",
    },
    {
      field: "createdAt",
      label: "Added",
    },
  ];

  const handleOnClick = (option: (typeof options)[0]) => {
    const newDirection =
      selected.field === option.field
        ? direction === "asc"
          ? "desc"
          : "asc"
        : "desc" ;

    setSelected({
      field: option.field,
      label: option.label,
    });

    setDirection(newDirection);

    updateSort({
      field: option.field,
      label: option.label,
      direction: newDirection,
    });
  };

  const renderArrow = () => {
    return direction === "asc" ? <ArrowUp /> : <ArrowDown />;
  };

  return (
    <DropdownMenu open={isOpen}>
      <DropdownMenuTrigger>
        <Button
          intent={"icon"}
          icon={ArrowDownUp}
          size={"fit"}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onInteractOutside={() => setIsOpen(false)}
      >
        <DropdownMenuLabel>Sort</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.field}
            onClick={() => {
              handleOnClick(option);
            }}
          >
            {option.label}
            {selected.field === option.field && renderArrow()}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
