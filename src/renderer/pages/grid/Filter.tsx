import MultiSelectCombobox from "@/components/combobox/MultiSelectCombobox";
import { Input } from "@/components/input/Input";
import { Company } from "@prisma/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Select, { MultiValue, MultiValueProps } from "react-select";

interface Props {
  expand: boolean;
}

export const Filters = ({ expand }: Props) => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ companies: Company[] }>({
    companies: [],
  });
  const [selectedDeveloper, setSelectedDeveloper] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.library.getFilters();
        setFilters(data);
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
          <Select
            isMulti
            name="colors"
            options={filters.companies.map((company) => ({
              value: company.id,
              label: company.name,
            }))}
            className="basic-multi-select z-9999"
            classNamePrefix="select"
            onChange={(choice) => setSelectedDeveloper(choice)}
          />
          <Select
            isMulti
            name="colors"
            options={filters.companies.map((company) => ({
              value: company.id,
              label: company.name,
            }))}
            className="basic-multi-select z-9999"
            classNamePrefix="select"
            onChange={(choice) => setSelectedDeveloper(choice)}
          />
        </div>
      </div>
    </div>
  );
};
