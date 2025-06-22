import { LOCALE_NAMESPACE } from "@common/constant";
import { Input } from "@render//components/input/Input";
import { useGames } from "@render//context/DatabaseContext";
import { unixToYYYYMMDD } from "@render//utils/util";
import { Card } from "@render/components/card/Card";
import _ from "lodash";
import React from "react";
import { InputText } from "./Input";
import { useTranslation } from "react-i18next";

export const TabInfo = () => {
  const { selectedGame } = useGames();
  const { t } = useTranslation();

  if (_.isNil(selectedGame)) {
    return <>...Loading</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title={"General Info"}>
        <div className="flex flex-col gap-8">
          <InputText
            title={"Name"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.name}
          />
          <InputText
            title={"Summary"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.summary}
          />
          <InputText
            title={"Id"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.id}
          />
          <InputText
            title={"External Id"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.externalId}
          />
          <InputText
            title={"Time Played"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.timePlayed}
          />
          <InputText
            title={"Play count"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.activities.length.toString()}
          />
        </div>
      </Card>

      <Card title={"Dates"}>
        <div className="flex flex-col gap-8">
          <InputText
            title={"Added to library"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.createdAt}
          />
          <InputText
            title={"Released date"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.releasedAt}
          />
          <InputText
            title={"Last time updated"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.updatedAt}
          />
          <InputText
            title={"Last played date"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={selectedGame.lastTimePlayed}
          />
        </div>
      </Card>

      <Card title={"Score"}>
        <div className="flex flex-col gap-8">
          <InputText
            title={"Critic"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={String(selectedGame.scoreCritic)}
          />
          <InputText
            title={"Community"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={String(selectedGame.scoreCommunity)}
          />
          <InputText
            title={"User"}
            description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputOnChange={(e) => {}}
            inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
            inputValue={String(selectedGame.scoreUser)}
          />
        </div>
      </Card>
    </div>
  );
};
