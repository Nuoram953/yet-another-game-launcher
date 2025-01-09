export interface IGame {
  id: number;
  name: string;
  timePlayed: number;
  status: number,
  playtimeWindows?:string,
  playtimeMac?:string,
  playtimeLinux?:string,
  playtimeSteamDeck?:string,
  lastPlayed?:number,
  playtimeDisconnected?:string
}

export interface ISteamGame {
  id: number;
  name: string;
  timePlayed: number;
  status: number,
  playtimeWindows?:string,
  playtimeMac?:string,
  playtimeLinux?:string,
  playtimeSteamDeck?:string,
  lastPlayed?:number,
  playtimeDisconnected?:string
}
