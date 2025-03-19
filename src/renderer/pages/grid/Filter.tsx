import { Input } from "@/components/input/Input";
import { useGames } from "@/context/DatabaseContext";
import { Company, Tag } from "@prisma/client";
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
  }>({
    companies: [],
    tags: [],
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
          expand ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border border-gray-200 bg-gray-100 p-4">
          <h3 className="mb-2 text-lg font-bold">Filters</h3>
          <Input placeholder="Game's name" />
          <div className="flex basis-4 flex-row justify-between gap-2 py-4">
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
                  console.log(choice);

                  updateFilters({ developpers: choice });
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
                onChange={(choice) => updateFilters({ publishers: choice })}
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
                onChange={(choice) => updateFilters({ tags: choice })}
                value={filters.tags}
              />
            </div>
        </div>
      </div>
    </div>
  );
};
