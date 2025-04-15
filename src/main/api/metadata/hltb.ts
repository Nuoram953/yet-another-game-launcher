import { Game } from "@prisma/client";
import axios from "../../../common/axiosConfig";
import _ from "lodash";

class HowLongToBeat {
  private token = "";

  constructor() {
    this.token = "6da7362d1fcf453e";
  }
  async search(name: string){
    const response = await axios.post(
      `https://howlongtobeat.com/api/ouch/${this.token}`,
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
    }
  }
}

export default HowLongToBeat;
