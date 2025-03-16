import React, { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  placeholder: string;
  emptyText: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedItems: string[]; // Fixed: properly typed as string[]
  setSelectedItems: (newItems: string[]) => void;
}

const MultiSelectCombobox = ({
  name,
  placeholder,
  emptyText,
  options,
  selectedItems = [], // Added default value to prevent undefined errors
  setSelectedItems,
}: Props) => {
  const [open, setOpen] = useState(false);

  // Use null check to prevent "undefined is not iterable" error
  const handleSelect = (currentValue: string) => {
    setOpen(false);
    
    // Make sure selectedItems is an array before using array methods
    const currentItems = Array.isArray(selectedItems) ? selectedItems : [];
    
    if (currentItems.includes(currentValue)) {
      // If item is already selected, remove it
      setSelectedItems(currentItems.filter((item) => item !== currentValue));
    } else {
      // Otherwise add it
      setSelectedItems([...currentItems, currentValue]);
    }
  };

  const handleRemoveItem = (item: string) => {
    // Make sure selectedItems is an array before using array methods
    const currentItems = Array.isArray(selectedItems) ? selectedItems : [];
    setSelectedItems(currentItems.filter((i) => i !== item));
  };

  // Safe check for rendering selected items
  const selectedItemsArray = Array.isArray(selectedItems) ? selectedItems : [];

  return (
    <div className="w-full space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
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
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItemsArray.includes(option.value) ? "opacity-100" : "opacity-0"
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
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedItemsArray.map((item) => {
            const option = options.find((o) => o.value === item);
            return (
              <Badge key={item} variant="secondary" className="text-sm">
                {option?.label || item}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveItem(item)}
                >
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
