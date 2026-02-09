export interface ResponseLaunchGame {
  success: boolean;
  message?: string;
}

export interface ResponseGetGame {
  success: boolean;
  data?: any;
  message?: string;
}

export interface ResponseSetGameStatus {
  success: boolean;
  message?: string;
}

export interface ResponseSetGameFavorite {
  success: boolean;
  message?: string;
}

export interface ResponseGameOperation {
  success: boolean;
  message?: string;
}
