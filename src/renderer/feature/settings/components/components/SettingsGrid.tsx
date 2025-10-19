import { LOCALE_NAMESPACE } from "@common/constant";
import { useConfig } from "@render/components/ConfigProvider";
import Section from "@render/components/new/section";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const SettingsGrid = () => {
  const { getConfigValue, setConfigValue, forceRefresh } = useConfig();
  const [fadeGamesNotInstalled, setFadeGamesNotInstalled] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      setFadeGamesNotInstalled(await getConfigValue("grid.display.fadeGamesNotInstalled"));
    };
    fetch();
  }, []);

  return (
    <>
      <Section>
        <Section.Title title={t("grid.sectionTitles.display", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("grid.display.fadeGamesNotInstalled.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("grid.display.fadeGamesNotInstalled.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={fadeGamesNotInstalled}
              handleCheckedChange={async () => {
                await setConfigValue("grid.display.fadeGamesNotInstalled", !fadeGamesNotInstalled);
                setFadeGamesNotInstalled((prev) => !prev);
                await forceRefresh();
              }}
            />
          </div>
        </Section.Content>
      </Section>
    </>
  );
};
