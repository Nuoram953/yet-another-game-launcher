import { BASE_URL, DEFAULT_HEADERS } from "./config";

export const fetchSearchId = async () => {
  try {
    let response = await fetch(BASE_URL, { headers: DEFAULT_HEADERS });
    let html = await response.text();

    const jsMatch = html.match(/_app-\w*\.js/);
    if (!jsMatch || jsMatch.length === 0) {
      return null;
    }

    const jsFile = jsMatch[0];
    const jsUrl = `${BASE_URL}/_next/static/chunks/pages/${jsFile}`;

    response = await fetch(jsUrl, { headers: DEFAULT_HEADERS });
    const jsContent = await response.text();

    const tokenMatch = jsContent.match(/"\/api\/seek\/"\.concat\("(\w*)"\)\.concat\("(\w*)"\)/);
    if (!tokenMatch || tokenMatch.length < 3) {
      return null;
    }

    const searchId = tokenMatch[1] + tokenMatch[2];
    return searchId;
  } catch (err) {
    console.error("Error fetching search ID:", err);
    return null;
  }
};
