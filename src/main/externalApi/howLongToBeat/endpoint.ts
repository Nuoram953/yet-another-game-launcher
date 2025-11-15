import axios from "@common/axiosConfig";
import _ from "lodash";
import { SearchApiResponse, SearchInitApiResponse } from "./types";
import { DEFAULT_HEADERS, SEARCH_INIT_URL, SEARCH_URL } from "./config";
import { fetchSearchId } from "./util";

export const init = async () => {
  const url = SEARCH_INIT_URL;
  const { data } = await axios.get<SearchInitApiResponse>(url, { params: { t: Date.now() }, headers: DEFAULT_HEADERS });

  return data.token;
};

export const search = async (name: string) => {
  const url = SEARCH_URL;
  const { data } = await axios.post<SearchApiResponse>(
    url,
    {
      searchOptions: {
        filter: "",
        games: {
          gameplay: {
            difficulty: "",
            flow: "",
            genre: "",
            perspective: "",
          },
          modifier: "",
          platform: "",
          rangeCategory: "main",
          rangeTime: {
            max: null,
            min: null,
          },
          rangeYear: {
            max: "",
            min: "",
          },
          sortCategory: "popular",
          userId: 0,
        },
        lists: {
          sortCategory: "follows",
        },
        randomizer: 0,
        sort: 0,
        users: {
          sortCategory: "postcount",
        },
      },
      searchPage: 1,
      searchTerms: name.split(" "),
      searchType: "games",
      size: 20,
      useCache: false,
    },
    {
      headers: { ...DEFAULT_HEADERS, "x-auth-token": await init() },
    },
  );

  const game = data.data[0];

  return {
    mainStory: game?.comp_main,
    mainPlusExtra: game?.comp_plus,
    completionist: game?.comp_100,
  };
};
