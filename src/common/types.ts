export interface IGame {
  id: number;
  name: string;
  timePlayed: number;
  status: number,
  playtimeWindows?:string,
  playtimeMac?:string,
  playtimeLinux?:string,
  playtimeSteamDeck?:string,
  lastPlayed?:string,
  playtimeDisconnected?:string
}
