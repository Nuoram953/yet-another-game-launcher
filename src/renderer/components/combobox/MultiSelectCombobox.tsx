import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@render//lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@render//components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@render//components/ui/popover";
import { Badge } from "@render//components/ui/badge";
import { Button } from "@render//components/ui/button";

interface Props {
  name: string;
  placeholder: string;
  emptyText: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedItems: string[];
  setSelectedItems: (newItems: string[]) => void;
}

const MultiSelectCombobox = ({
  name,
  placeholder,
  emptyText,
  options,
  selectedItems = [],
  setSelectedItems,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: string) => {
    setOpen(false);

    const currentItems = Array.isArray(selectedItems) ? selectedItems : [];

    if (currentItems.includes(currentValue)) {
      setSelectedItems(currentItems.filter((item) => item !== currentValue));
    } else {
      setSelectedItems([...currentItems, currentValue]);
    }
  };

  const handleRemoveItem = (item: string) => {
    const currentItems = Array.isArray(selectedItems) ? selectedItems : [];
    setSelectedItems(currentItems.filter((i) => i !== item));
  };

  const selectedItemsArray = Array.isArray(selectedItems) ? selectedItems : [];

  return (
    <div className="w-full space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <span className="truncate">
              {selectedItemsArray
                ? `${selectedItemsArray.length} item${selectedItemsArray.length > 1 ? "s" : ""} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${name}...`} />
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItemsArray.includes(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected items with null safety */}
      {selectedItemsArray.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedItemsArray.map((item) => {
            const option = options.find((o) => o.value === item);
            return (
              <Badge key={item} variant="secondary" className="text-sm">
                {option?.label || item}
                <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => handleRemoveItem(item)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectCombobox;
