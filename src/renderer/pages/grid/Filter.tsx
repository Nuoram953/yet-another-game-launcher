import { Input } from "@render//components/input/Input";
import { Checkbox } from "@render//components/ui/checkbox";
import { useGames } from "@render//context/DatabaseContext";
import { Company, GameStatus, Tag } from "@prisma/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Select from "react-select";

interface Props {
  expand: boolean;
}

export const Filters = ({ expand }: Props) => {
  const { updateFilters, filters } = useGames();
  const [loading, setLoading] = useState(true);
  const [filtersData, setFiltersData] = useState<{
    companies: Company[];
    tags: Tag[];
    status: GameStatus[];
  }>({
    companies: [],
    tags: [],
    status: [],
  });

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

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className={expand ? `mb-4` : ""}>
      <div
        className={`overflow transition-all duration-300 ease-in-out ${
          expand ? "mt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border border-gray-200 bg-gray-100 p-4">
          <h3 className="mb-2 text-lg font-bold">Filters</h3>
          <div className="flex flex-col gap-4">
            <Input placeholder="Game's name" />
            <div>
              <div className="flex flex-row gap-2">
                <Checkbox />
                <label>Installed</label>
              </div>

              <div className="flex flex-row gap-2">
                <Checkbox />
                <label>Favorite</label>
              </div>

              <div className="flex flex-row gap-2">
                <Checkbox />
                <label>Achievements</label>
              </div>
            </div>
            <div className="flex basis-4 flex-row justify-between gap-2">
              <div className="w-full">
                <h2>Developer</h2>
                <Select
                  isMulti
                  name="colors"
                  options={filtersData.companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))}
                  className="basic-multi-select z-9999"
                  classNamePrefix="select"
                  onChange={(choice) => {
                    updateFilters({ developpers: [...choice] });
                  }}
                  value={filters.developpers}
                />
              </div>
              <div className="w-full">
                <h2>Publisher</h2>
                <Select
                  isMulti
                  name="colors"
                  options={filtersData.companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))}
                  className="basic-multi-select z-9999"
                  classNamePrefix="select"
                  onChange={(choice) => updateFilters({ publishers: [...choice] })}
                  value={filters.publishers}
                />
              </div>
            </div>

            <div className="w-full">
              <h2>Tags</h2>
              <Select
                isMulti
                name="colors"
                options={filtersData.tags.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                className="basic-multi-select z-9999"
                classNamePrefix="select"
                onChange={(choice) => updateFilters({ tags: [...choice] })}
                value={filters.tags}
              />
            </div>

            <div className="w-full">
              <h2>Status</h2>
              <Select
                isMulti
                name="colors"
                options={filtersData.status.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                }))}
                className="basic-multi-select z-9999"
                classNamePrefix="select"
                onChange={(choice) => updateFilters({ status: [...choice] })}
                value={filters.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
