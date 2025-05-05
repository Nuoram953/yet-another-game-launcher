export interface SearchResponse {
  id: number;
  name: string;
  dist: number;
  relation: string;
}

export interface GameResponse {
  images: {
    box: {
      og: string;
      sm: string;
    };
    square: {
      og: string;
      xs: string;
      sm: string;
      lg: string;
    };
    masthead: {
      og: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    banner: {
      og: string;
      sm: string;
    };
    screenshots: {
      og: string;
      sm: string;
      _id: string;
    }[];
  };
  isPre2015: boolean;
  hasLootBoxes: boolean;
  isMajorTitle: boolean;
  percentRecommended: number;
  numReviews: number;
  numTopCriticReviews: number;
  medianScore: number;
  topCriticScore: number;
  percentile: number;
  tier: string;
  name: string;
  description: string;
  screenshots: {
    _id: string;
    fullRes: string;
    thumbnail: string;
  }[];
  trailers: [];
  mastheadScreenshot: {
    fullRes: string;
    thumbnail: string;
  };
  embargoDate: string;
  Companies: {
    name: string;
    type: string;
  }[];
  Platforms: {
    id: number;
    name: string;
    shortName: string;
    imageSrc: string;
    releaseDate: string;
    displayRelease: string | null;
  }[];
  Genres: {
    id: number;
    name: string;
  }[];
  Affiliates: {
    externalUrl: string;
    name: string;
  }[];
  id: 1508;
  firstReleaseDate: string;
  createdAt: string;
  updatedAt: string;
  firstReviewDate: string;
  latestReviewDate: string;
  bannerScreenshot: {
    fullRes: string;
  };
  monetizationFeatures: {
    hasLootBoxes: false;
  };
  squareScreenshot: {
    fullRes: string;
    thumbnail: string;
  };
  verticalLogoScreenshot: {
    fullRes: string;
    thumbnail: string;
  };
  imageMigrationComplete: true;
  tenthReviewDate: string;
  criticalReviewDate: string;
  biggestDiscountDollars: number;
  biggestDiscountPercentage: number;
  needsAdminDealReview: boolean;
  tags: string[];
  url: string;
}
