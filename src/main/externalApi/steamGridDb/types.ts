export interface MediaResponse {
  success: boolean;
  page: number;
  total: number;
  limit: number;
  data: {
    id: number;
    score: number;
    style: string;
    mime: string;
    url: string;
    thumb: string;
    tags: string[];
    author: {
      name: string;
      steam64: string;
      avatar: string;
    };
  }[];
}

export interface GetExternalGameIdResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    types: string[];
    verified: boolean;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    types: string[];
    verified: boolean;
  }[];
}
