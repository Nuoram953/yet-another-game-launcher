import { FilterConfig } from "@common/types";

export function buildTimePlayedWhereClause(timePlayedFilters: FilterConfig["timePlayed"]) {
  if (!timePlayedFilters || timePlayedFilters.length === 0) {
    return [];
  }

  return timePlayedFilters.map((filter) => {
    const value = filter.value.trim();
    let condition = {};

    if (value.startsWith("<")) {
      const hours = parseFloat(value.substring(1));
      const minutes = hours * 60;
      condition = { timePlayed: { lt: minutes } };
    } else if (value.startsWith(">")) {
      const hours = parseFloat(value.substring(1));
      const minutes = hours * 60;
      condition = { timePlayed: { gt: minutes } };
    } else if (value.includes("-")) {
      const [min, max] = value.split("-").map((v) => parseFloat(v));
      condition = {
        timePlayed: {
          gte: min * 60,
          lte: max * 60,
        },
      };
    } else if (!isNaN(parseFloat(value))) {
      condition = { timePlayed: { equals: parseFloat(value) * 60 } };
    }

    return condition;
  });
}

export function buildMainStoryWhereClause(mainStoryFilters: FilterConfig["mainStory"]) {
  if (!mainStoryFilters || mainStoryFilters.length === 0) {
    return [];
  }

  return mainStoryFilters.map((filter) => {
    const value = filter.value.trim();
    let condition = {};

    if (value.startsWith("<")) {
      const hours = parseFloat(value.substring(1));
      const secondHours = hours * 3600;
      condition = { mainStory: { lt: secondHours } };
    } else if (value.startsWith(">")) {
      const hours = parseFloat(value.substring(1));
      const secondHours = hours * 3600;
      condition = { mainStory: { gt: secondHours } };
    } else if (value.includes("-")) {
      const [min, max] = value.split("-").map((v) => parseFloat(v));
      condition = {
        mainStory: {
          gte: min * 3600,
          lte: max * 3600,
        },
      };
    } else if (!isNaN(parseFloat(value))) {
      condition = { mainStory: { equals: parseFloat(value) * 3600 } };
    }

    return condition;
  });
}
