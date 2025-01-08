import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { ChevronRight, Search } from "lucide-react";

const SearchWithFilters = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0]);

  return (
    <div className="w-full p-4">
      <div className="flex gap-2 mb-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="w-full pl-8" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-90" : ""}`}
          />
        </Button>
      </div>

      {isFilterOpen && (
        <div className="border rounded-lg p-4 space-y-6 bg-card">
          <div className="space-y-4">
            <h3 className="font-medium">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="electronics" />
                <label htmlFor="electronics">Electronics</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="clothing" />
                <label htmlFor="clothing">Clothing</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="books" />
                <label htmlFor="books">Books</label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Price Range</h3>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000}
              step={10}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Up to ${priceRange[0]}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Availability</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" />
                <label htmlFor="in-stock">In Stock</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="on-sale" />
                <label htmlFor="on-sale">On Sale</label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchWithFilters;
