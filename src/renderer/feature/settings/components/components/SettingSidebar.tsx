import { LOCALE_NAMESPACE } from "@common/constant";
import { useConfig } from "@render/components/ConfigProvider";
import Section from "@render/components/new/section";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const SettingSidebar = () => {
  const { getConfigValue, setConfigValue, forceRefresh } = useConfig();
  const [showGameCount, setShowGameCount] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      setShowGameCount(await getConfigValue("sidebar.display.showGameCount"));
    };
    fetch();
  }, []);

  return (
    <>
      <Section>
        <Section.Title title={t("sidebar.sectionTitles.display", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("sidebar.display.showGameCount.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("sidebar.display.showGameCount.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={showGameCount}
              handleCheckedChange={async () => {
                await setConfigValue("sidebar.display.showGameCount", !showGameCount);
                setShowGameCount((prev) => !prev);
                await forceRefresh();
              }}
            />
          </div>
        </Section.Content>
      </Section>
    </>
  );
};
