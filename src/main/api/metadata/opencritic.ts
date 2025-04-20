import axios from "../../../common/axiosConfig";
import _ from "lodash";

class OpenCritic {
  constructor() {}

  async search(name: string) {
    const response = await axios.get(
      `https://api.opencritic.com/api/meta/search`,
      {
        params: {
          criteria: name,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
          "content-type": "application/json",
          origin: "https://opencritic.com/",
          referer: "https://opencritic.com/",
        },
      },
    );

    if (_.isEmpty(response.data)) {
      return null;
    }

    const game = response.data[0];

    const openCriticGame = await this.getById(game.id);

    console.log(openCriticGame);

    return {
      mainStory: game.comp_main,
      mainPlusExtra: game.comp_plus,
      completionist: game.comp_100,
    };
  }

  async getById(id: number) {
    const response = await axios.get(
      `https://api.opencritic.com/api/game/${id}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
          "content-type": "application/json",
          origin: "https://opencritic.com/",
          referer: "https://opencritic.com/",
        },
      },
    );

    if (_.isEmpty(response.data)) {
      return null;
    }

    return response.data;
  }
}

export default OpenCritic;
