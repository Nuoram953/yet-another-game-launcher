import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@render/components/ui/sheet";
import { Filter, Save, Trash } from "lucide-react";
import { Button } from "@render/components/button/Button";
import { useGames } from "@render/context/DatabaseContext";
import { Company, GameStatus, Tag, Storefront, FilterPreset } from "@prisma/client";
import { Select, SelectOption } from "@render/components/input/Select";
import { Checkbox } from "@render/components/input/Checkbox";
import { useTranslation } from "react-i18next";
import { getLibrary } from "@render/api/electron";
import _ from "lodash";
import { useNotifications } from "@render/components/NotificationSystem";
import Divider from "@render/components/Divider";
import { LOCALE_NAMESPACE } from "@common/constant";
import { MultiValue } from "react-select";

export function FilterSheet() {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { updateFilters, filters } = useGames();
  const [filtersData, setFiltersData] = useState<{
    presets: FilterPreset[];
    companies: Company[];
    tags: Tag[];
    status: GameStatus[];
    storefronts: Storefront[];
  }>({
    presets: [],
    companies: [],
    tags: [],
    status: [],
    storefronts: [],
  });

  const [presetName, setPresetName] = useState("");
  const [placeholderFilters, setPlaceholderFilters] = useState({
    selectedPreset: filters.selectedPreset || null,
    developpers: filters.developpers || [],
    publishers: filters.publishers || [],
    tags: filters.tags || [],
    status: filters.status || [],
    isInstalled: filters.isInstalled || false,
    isFavorite: filters.isFavorite || false,
    storefronts: filters.storefronts || [],
    timePlayed: filters.timePlayed || [],
    mainStory: filters.mainStory || [],
    dateAdded: filters.dateAdded || [],
    lastTimePlayed: filters.lastTimePlayed || [],
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
  }, [reloadTrigger]);

  const reload = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSave = () => {
    updateFilters(placeholderFilters);
  };

  const handleDeletePreset = () => {
    window.library.deleteFilterPreset(placeholderFilters.selectedPreset.label);
    addNotification({
      title: "Deleted",
      message: "Your preset has been removed.",
      type: "success",
      duration: 2000,
    });

    setPlaceholderFilters({
      selectedPreset: null,
      developpers: [],
      publishers: [],
      tags: [],
      status: [],
      isInstalled: false,
      isFavorite: false,
      storefronts: [],
      timePlayed: [],
      mainStory: [],
      dateAdded: [],
      lastTimePlayed: [],
    });
    reload();
  };

  const handleSavePreset = async () => {
    await getLibrary().setFilterPreset({
      name: presetName,
      config: placeholderFilters,
    });
    addNotification({
      title: "Saved",
      message: "Your preset has been saved.",
      type: "success",
      duration: 2000,
    });

    reload();
  };

  return (
    <>
      <Sheet key={"button"}>
        <SheetTrigger asChild>
          <Button intent={"icon"} icon={Filter} size={"fit"} />
        </SheetTrigger>
        <SheetContent side={"right"} color="#1e293b">
          <SheetHeader>
            <SheetTitle>{t("title", { ns: LOCALE_NAMESPACE.FILTER })}</SheetTitle>
            <SheetDescription>{t("description", { ns: LOCALE_NAMESPACE.FILTER })}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-1">
              <Select
                isMulti={false}
                allowCustomValues={true}
                label={t("filters.preset.label", { ns: LOCALE_NAMESPACE.FILTER })}
                tooltip={t("filters.preset.tooltip", { ns: LOCALE_NAMESPACE.FILTER })}
                options={filtersData.presets.map((preset) => ({
                  value: JSON.stringify(preset.config),
                  label: preset.name,
                }))}
                onChange={(choice: SelectOption) => {
                  if (_.isNull(choice)) {
                    setPlaceholderFilters({
                      selectedPreset: null,
                      developpers: [],
                      publishers: [],
                      tags: [],
                      status: [],
                      isInstalled: false,
                      isFavorite: false,
                      storefronts: [],
                      timePlayed: [],
                      mainStory: [],
                      dateAdded: [],
                      lastTimePlayed: [],
                    });
                    return;
                  }

                  setPlaceholderFilters({
                    ...JSON.parse(choice.value),
                    selectedPreset: choice ? choice : null,
                  });
                }}
                values={[placeholderFilters.selectedPreset]}
              />
              <div className="flex flex-row items-center justify-center gap-2">
                <Button intent="icon" size="fit" icon={Save} onClick={handleSavePreset} />
                {placeholderFilters.selectedPreset && (
                  <Button intent="icon" size="fit" icon={Trash} onClick={handleDeletePreset} />
                )}
              </div>
            </div>
            <Divider />
            <Checkbox
              label={t("filters.isInstalled.label", { ns: LOCALE_NAMESPACE.FILTER })}
              checked={placeholderFilters.isInstalled}
              setValue={(value) => {
                setPlaceholderFilters((prev) => ({ ...prev, isInstalled: value }));
              }}
            />
            <Checkbox
              label={t("filters.isFavorite.label", { ns: LOCALE_NAMESPACE.FILTER })}
              checked={placeholderFilters.isFavorite}
              setValue={(value) => {
                setPlaceholderFilters((prev) => ({ ...prev, isFavorite: value }));
              }}
            />

            <Select
              label={t("filters.status.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={filtersData.status.map((status) => ({
                value: String(status.id),
                label: t(status.name, { ns: "GameStatus" }),
              }))}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  status: [...choice],
                });
              }}
              values={placeholderFilters.status}
            />
            <Select
              label={t("filters.developer.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={filtersData.companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  developpers: [...choice],
                });
              }}
              values={placeholderFilters.developpers}
            />
            <Select
              label={t("filters.publisher.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={filtersData.companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  publishers: [...choice],
                });
              }}
              values={placeholderFilters.publishers}
            />
            <Select
              label={t("filters.tags.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={filtersData.tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }))}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  tags: [...choice],
                });
              }}
              values={placeholderFilters.tags}
            />

            <Select
              label={t("filters.store.label", { ns: LOCALE_NAMESPACE.FILTER })}
              allowCustomValues={true}
              options={filtersData.storefronts.map((store) => ({
                value: String(store.id),
                label: t(`storefront.${store.name}`, { ns: "common" }),
              }))}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  storefronts: [...choice],
                });
              }}
              values={placeholderFilters.storefronts}
            />

            <Select
              label={t("filters.timePlayed.label", { ns: LOCALE_NAMESPACE.FILTER })}
              allowCustomValues={true}
              tooltip={t("filters.timePlayed.tooltip", { ns: LOCALE_NAMESPACE.FILTER })}
              options={[
                {
                  value: "0",
                  label: t("filters.timePlayed.options.never", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<1",
                  label: t("filters.timePlayed.options.lessThan1Hour", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<5",
                  label: t("filters.timePlayed.options.lessThan5Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<10",
                  label: t("filters.timePlayed.options.lessThan10Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<20",
                  label: t("filters.timePlayed.options.lessThan20Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<50",
                  label: t("filters.timePlayed.options.lessThan50Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: ">100",
                  label: t("filters.timePlayed.options.moreThan100Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
              ]}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  timePlayed: [...choice],
                });
              }}
              values={placeholderFilters.timePlayed}
            />

            <Select
              label={t("filters.howLongToBeat.label", { ns: LOCALE_NAMESPACE.FILTER })}
              allowCustomValues={true}
              tooltip={t("filters.howLongToBeat.tooltip", { ns: LOCALE_NAMESPACE.FILTER })}
              options={[
                {
                  value: "0",
                  label: t("filters.howLongToBeat.options.never", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<1",
                  label: t("filters.howLongToBeat.options.lessThan1Hour", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<5",
                  label: t("filters.howLongToBeat.options.lessThan5Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<10",
                  label: t("filters.howLongToBeat.options.lessThan10Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<20",
                  label: t("filters.howLongToBeat.options.lessThan20Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "<50",
                  label: t("filters.howLongToBeat.options.lessThan50Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: ">100",
                  label: t("filters.howLongToBeat.options.moreThan100Hours", { ns: LOCALE_NAMESPACE.FILTER }),
                },
              ]}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  mainStory: [...choice],
                });
              }}
              values={placeholderFilters.mainStory}
            />

            <Select
              label={t("filters.dateAdded.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={[
                {
                  value: "today",
                  label: t("filters.dateAdded.options.today", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "week",
                  label: t("filters.dateAdded.options.week", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "month",
                  label: t("filters.dateAdded.options.month", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "year",
                  label: t("filters.dateAdded.options.year", { ns: LOCALE_NAMESPACE.FILTER }),
                },
              ]}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  dateAdded: [...choice],
                });
              }}
              values={placeholderFilters.dateAdded}
            />
            <Select
              label={t("filters.lastTimePlayed.label", { ns: LOCALE_NAMESPACE.FILTER })}
              options={[
                {
                  value: "today",
                  label: t("filters.lastTimePlayed.options.today", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "week",
                  label: t("filters.lastTimePlayed.options.week", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "month",
                  label: t("filters.lastTimePlayed.options.month", { ns: LOCALE_NAMESPACE.FILTER }),
                },
                {
                  value: "year",
                  label: t("filters.lastTimePlayed.options.year", { ns: LOCALE_NAMESPACE.FILTER }),
                },
              ]}
              onChange={(choice: MultiValue<SelectOption>) => {
                setPlaceholderFilters({
                  ...placeholderFilters,
                  lastTimePlayed: [...choice],
                });
              }}
              values={placeholderFilters.lastTimePlayed}
            />
          </div>

          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button
                type="submit"
                intent={"primary"}
                text={t("apply", { ns: LOCALE_NAMESPACE.FILTER })}
                onClick={handleSave}
              />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
