export interface AppConfig {
  state:{
    sidebar:{
      open: boolean;
    }
  }
  store: {
    steam: {
      enable: boolean;
    };
    epic: {
      enable: boolean;
    };
  };
}
