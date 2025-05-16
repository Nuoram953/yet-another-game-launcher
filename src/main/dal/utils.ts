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

export function buildDateAddedWhereClause(dateOptions) {
  if (!dateOptions || dateOptions.length === 0) {
    return [];
  }

  return dateOptions.map((option) => {
    const now = new Date();
    let startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    switch (option.value) {
      case "today":
        return {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        };

      case "week":
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        return {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        };

      case "month":
        startDate.setDate(1);

        return {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        };

      case "year":
        startDate.setMonth(0, 1);

        return {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        };

      default:
        if (typeof option.value === "string" && option.value.includes("-")) {
          const [startTimestamp, endTimestamp] = option.value.split("-").map(Number);

          const startDate = new Date(startTimestamp * 1000);
          const endDate = new Date(endTimestamp * 1000);

          return {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          };
        }

        return {};
    }
  });
}

export function buildLastTimePlayedWhereClause(dateOptions) {
  if (!dateOptions || dateOptions.length === 0) {
    return [];
  }

  return dateOptions.map((option) => {
    const now = new Date();
    let startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    switch (option.value) {
      case "today":
        return {
          lastTimePlayed: {
            gte: BigInt(Math.floor(startDate.getTime() / 1000)),
            lte: BigInt(Math.floor(now.getTime() / 1000)),
          },
        };

      case "week":
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        return {
          lastTimePlayed: {
            gte: BigInt(Math.floor(startDate.getTime() / 1000)),
            lte: BigInt(Math.floor(now.getTime() / 1000)),
          },
        };

      case "month":
        startDate.setDate(1);

        return {
          lastTimePlayed: {
            gte: BigInt(Math.floor(startDate.getTime() / 1000)),
            lte: BigInt(Math.floor(now.getTime() / 1000)),
          },
        };

      case "year":
        startDate.setMonth(0, 1);

        return {
          lastTimePlayed: {
            gte: BigInt(Math.floor(startDate.getTime() / 1000)),
            lte: BigInt(Math.floor(now.getTime() / 1000)),
          },
        };

      default:
        if (typeof option.value === "string" && option.value.includes("-")) {
          const [startTimestamp, endTimestamp] = option.value.split("-").map((timestamp) => BigInt(timestamp));

          return {
            lastTimePlayed: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
          };
        }

        return {};
    }
  });
}
