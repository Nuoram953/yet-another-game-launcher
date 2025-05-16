import axios from "axios";
import { DEFAULT_HEADERS, GAME_URL, SEARCH_URL } from "./config";
import { GameResponse, SearchResponse } from "./types";
import _ from "lodash";

export const search = async (name: string) => {
  const res = await axios.get<SearchResponse[]>(SEARCH_URL, {
    params: {
      criteria: name,
    },
    headers: DEFAULT_HEADERS,
  });

  return res.data;
};

export const getGame = async (name: string) => {
  const searchResults = await search(name);
  if (_.isEmpty(searchResults)) {
    return null;
  }

  const res = await axios.get<GameResponse>(`${GAME_URL}/${searchResults[0].id}`, {
    headers: DEFAULT_HEADERS,
  });

  return res.data;
};
