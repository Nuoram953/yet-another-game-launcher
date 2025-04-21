import axios from "../../../common/axiosConfig";
import _ from "lodash";

class HowLongToBeat {

  constructor() {
  }

  async fetchSearchId(): Promise<string | null> {
    try {
      const urlBase = "https://howlongtobeat.com";
      let response = await fetch(urlBase);
      let html = await response.text();

      const jsMatch = html.match(/_app-\w*\.js/);
      if (!jsMatch || jsMatch.length === 0) {
        return null;
      }

      const jsFile = jsMatch[0];
      const jsUrl = `${urlBase}/_next/static/chunks/pages/${jsFile}`;

      response = await fetch(jsUrl);
      const jsContent = await response.text();

      const tokenMatch = jsContent.match(
        /"\/api\/seek\/"\.concat\("(\w*)"\)\.concat\("(\w*)"\)/,
      );
      if (!tokenMatch || tokenMatch.length < 3) {
        return null;
      }

      const searchId = tokenMatch[1] + tokenMatch[2];
      return searchId;
    } catch (err) {
      console.error("Error fetching search ID:", err);
      return null;
    }
  }

  async search(name: string) {
    const response = await axios.post(
      `https://howlongtobeat.com/api/seek/${await this.fetchSearchId()}`,
      {
        searchOptions: {
          filter: "",
          games: {
            gameplay: {
              difficulty: "",
              flow: "",
              genre: "",
              perspective: "",
            },
            modifier: "",
            platform: "",
            rangeCategory: "main",
            rangeTime: {
              max: null,
              min: null,
            },
            rangeYear: {
              max: "",
              min: "",
            },
            sortCategory: "popular",
            userId: 0,
          },
          lists: {
            sortCategory: "follows",
          },
          randomizer: 0,
          sort: 0,
          users: {
            sortCategory: "postcount",
          },
        },
        searchPage: 1,
        searchTerms: name.split(" "),
        searchType: "games",
        size: 20,
        useCache: false,
      },

      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
          "content-type": "application/json",
          origin: "https://howlongtobeat.com/",
          referer: "https://howlongtobeat.com/",
        },
      },
    );

    if (_.isEmpty(response.data)) {
      return null;
    }

    console.log(response.data);
    console.log(name.split(" "));

    const game = response.data.data[0];

    return {
      mainStory: game.comp_main,
      mainPlusExtra: game.comp_plus,
      completionist: game.comp_100,
    };
  }
}

export default HowLongToBeat;
