import { Emulator } from "@common/constant";

export const citron = { id: Emulator.CITRON, name: "Citron" };

export const citronOptions = [
  {
    emulatorId: Emulator.CITRON,
    name: "config",
    short: "-c",
    long: "--config",
    description: "Load the specified configuration file",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "fullscreen",
    short: "-f",
    long: "--fullscreen",
    description: "Start in fullscreen mode",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "game",
    short: "-g",
    long: "--game",
    description: "File path of the game to load",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "help",
    short: "-h",
    long: "--help",
    description: "Display this help and exit",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "multiplayer",
    short: "-m",
    long: "--multiplayer",
    description: "Nickname, password, address and port for multiplayer",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "program",
    short: "-p",
    long: "--program",
    description: "Pass following string as arguments to executable",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "user",
    short: "-u",
    long: "--user",
    description: "Select a specific user profile from 0 to 7",
    defaultValue: null,
  },
  {
    emulatorId: Emulator.CITRON,
    name: "version",
    short: "-v",
    long: "--version",
    description: "Output version information and exit",
    defaultValue: null,
  },
];
