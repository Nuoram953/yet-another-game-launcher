import MultiSelectCombobox from "@/components/combobox/MultiSelectCombobox";
import { Input } from "@/components/input/Input";
import { Company } from "@prisma/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";

interface Props {
  expand: boolean;
}

export const Filters = ({ expand }: Props) => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ companies: Company[] }>({
    companies: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.library.getFilters();
        console.log(data);
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expand ? " mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border border-gray-200 bg-gray-100 p-4">
          <h3 className="mb-2 text-lg font-bold">Filters</h3>
          <Input placeholder="Game's name" />
          <MultiSelectCombobox
            options={filters.companies.map((company) => ({
              label: company.name!,
              value: company.id,
            }))}
          />
        </div>
      </div>
    </div>
  );
};
