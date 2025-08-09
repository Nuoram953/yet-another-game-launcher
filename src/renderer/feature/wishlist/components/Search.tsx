import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { getGames } from "../api/get-games";
import { useDebounce } from "@render/hooks/useDebounce";
import { useAddWishlistItem } from "../api/post-wishlist-item";

export const Search = () => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const debouncedInput = useDebounce(inputValue, 500);
  const selectRef = React.useRef(null);
  const createWishlistItem = useAddWishlistItem({
    externalId: 0,
    mutationConfig: {
      onSuccess: () => {
        // Optionally handle success (e.g., show a notification)
      },
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      if (!debouncedInput || debouncedInput.length < 2) {
        setOptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getGames({ search: debouncedInput });
        const mappedOptions = results.map((g: any) => ({
          value: g.id,
          label: g.name,
          image: g.cover?.url,
        }));
        setOptions(mappedOptions);
        setMenuIsOpen(true);
      } catch (err) {
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [debouncedInput]);

  const handleInputChange = useCallback((value: string, actionMeta: any) => {
    setInputValue(value);
    if (value.length >= 2) {
      setIsLoading(true);
      setMenuIsOpen(true);
    } else {
      setOptions([]);
      setMenuIsOpen(false);
    }
    return value;
  }, []);

  const clearValue = () => {
    // @ts-ignore
    selectRef.select.clearValue();
  };

  return (
    <Select
      ref={selectRef}
      options={options}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      menuIsOpen={menuIsOpen}
      onChange={(selectedOption) => {
        createWishlistItem.mutate({ externalId: selectedOption.value });
        console.log("Selected game:", selectedOption);
        clearValue();
      }}
      onMenuOpen={() => setMenuIsOpen(true)}
      onMenuClose={() => setMenuIsOpen(false)}
      styles={{
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
      }}
      filterOption={() => true}
      placeholder="Search games..."
      isClearable
      backspaceRemovesValue={false}
      noOptionsMessage={() => (inputValue.length < 2 ? "Type at least 2 characters" : "No games found")}
      formatOptionLabel={(option: any) => (
        <div className="flex items-center gap-2">
          {option.image && <img src={option.image} alt={option.label} className="h-8 w-8 rounded object-cover" />}
          <span>{option.label}</span>
        </div>
      )}
    />
  );
};
