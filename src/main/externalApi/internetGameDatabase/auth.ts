import axios from "axios";
import { getAuthUrl } from "./config";
import { authenticationResponse } from "./types";

let cachedToken: string;
let expirationInSeconds: number = 0;

export const getToken = async (): Promise<string> => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  if (cachedToken && currentTimeInSeconds < expirationInSeconds) {
    return cachedToken;
  }

  const res = await axios.post<authenticationResponse>(await getAuthUrl());

  cachedToken = res.data.access_token;
  expirationInSeconds = currentTimeInSeconds + Number(res.data.expires_in);

  return cachedToken;
};
