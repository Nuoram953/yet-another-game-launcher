export interface authenticationResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface IGame {
  id: number;
  age_ratings: number[];
  aggregated_rating: number;
  aggregated_rating_count: number;
  alternative_names: number[];
  artworks: number[];
  category: number;
  cover: number;
  created_at: number;
  external_games: number[];
  first_release_date: number;
  franchises: number[];
  game_engines: object[];
  game_modes: object[];
  genres: object[];
  hypes: number;
  involved_companies: number[];
  name: string;
  parent_game: number;
  platforms: object[];
  player_perspectives: object[];
  rating: number;
  rating_count: number;
  release_dates: number[];
  screenshots: { url: string }[];
  similar_games: number[];
  slug: string;
  storyline: string;
  summary: string;
  tags: number[];
  themes: object[];
  total_rating: number;
  total_rating_count: number;
  updated_at: number;
  url: string;
  videos: number[];
  websites: number[];
  checksum: string;
  language_supports: number[];
  collections: number[];
  game_type: number;
}

export interface IExternalGame {
  id: number;
  category: number;
  created_at: number;
  game: number;
  name: string;
  uid: string;
  updated_at: number;
  url: string;
  year: number;
  checksum: string;
  external_game_source: number;
}

export interface IInvolvedCompany {
  id: string;
  company: {
    id: number;
    change_date_category: number;
    country: number;
    created_at: number;
    description: string;
    developed: any[];
    logo: number;
    name: string;
    parent: number;
    published: any[];
    slug: string;
    start_date: number;
    start_date_category: number;
    updated_at: number;
    url: string;
    websites: any[];
    checksum: string;
    status: number;
    start_date_format: number;
  };
  created_at: number;
  developer: boolean;
  game: number;
  porting: boolean;
  publisher: boolean;
  supporting: boolean;
  updated_at: number;
  checksum: string;
}

export interface searchResponse {}
