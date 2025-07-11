import { LOCALE_NAMESPACE } from "@common/constant";
import { useConfig } from "@render/components/ConfigProvider";
import { Card } from "@render/components/card/Card";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Card title={t("sidebar.sectionTitles.layout", { ns: LOCALE_NAMESPACE.SETTINGS })}>
          <div className="flex flex-col gap-8"></div>
        </Card>

        <Card title={t("sidebar.sectionTitles.display", { ns: LOCALE_NAMESPACE.SETTINGS })}>
          <div className="flex flex-col gap-4">
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
        </Card>

        <Card title={t("sidebar.sectionTitles.content", { ns: LOCALE_NAMESPACE.SETTINGS })}>
          <div className="flex flex-col gap-4"></div>
        </Card>
      </div>
    </div>
  );
};
