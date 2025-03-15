import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "../input/Input";

interface Props {
  items: [];
  options: {
    value: string;
    label: string;
  }[];
}

const MultiSelectCombobox = ({ items, options }: Props) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update filtered options whenever input changes or selected items change
  useEffect(() => {
    const filtered = options.filter(
      (option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.some((item) => item.value === option.value),
    );

    setFilteredOptions(filtered);
  }, [inputValue, selectedItems]);

  // Handle selection of an item
  const handleSelect = (option) => {
    const newSelectedItems = [...selectedItems, option];
    setSelectedItems(newSelectedItems);
    setInputValue("");
  };

  // Handle removal of an item
  const handleRemove = (value) => {
    const newSelectedItems = selectedItems.filter(
      (item) => item.value !== value,
    );
    setSelectedItems(newSelectedItems);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <h2 className="mb-2 text-lg font-medium">Select Frameworks</h2>

      <div className="relative" ref={dropdownRef} style={{ zIndex: 50 }}>
        {/* Selected items */}
        <div className="flex flex-row gap-1">
          {selectedItems.map((item) => (
            <div
              key={item.value}
              className="w-fit items-center gap-2 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
            >
              {item.label}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.value);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Input field */}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedItems.length === 0 ? "Select frameworks..." : ""}
        />

        {/* Dropdown options with fixed positioning */}
        {isOpen && (
          <div
            className="fixed max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
            style={{
              zIndex: 999,
              width: dropdownRef.current?.offsetWidth,
              top:
                dropdownRef.current?.getBoundingClientRect().bottom +
                window.scrollY,
              left:
                dropdownRef.current?.getBoundingClientRect().left +
                window.scrollX,
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-100"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectCombobox;
