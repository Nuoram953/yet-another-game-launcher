import { app } from "electron";
import path from "path";

export const BASE_URL = "https://www.youtube.com/";

export const COOKIE_PATH = path.join(app.getPath("userData"), "cookies.txt");
