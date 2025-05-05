import axios from "axios";
import { DEFAULT_HEADERS, SEARCH_URL } from "./config";
import { SearchResponse } from "./types";

export const search = (name: string) => {
  const res = axios.get<SearchResponse[]>(SEARCH_URL, {
    params: {
      criteria: name,
      headers: DEFAULT_HEADERS,
    },
  });
};
