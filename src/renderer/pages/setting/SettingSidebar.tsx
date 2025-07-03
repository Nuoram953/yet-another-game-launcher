import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";

export const SettingSidebar = () => {
  const [showGameCount, setShowGameCount] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      setShowGameCount(await window.config.get("sidebar.display.showGameCount"));
    };
    fetch();
  }, []);

  const debouncedSetPath = useCallback(
    _.debounce((key, value) => {
      window.config.set(key, value);
    }, 500),
    [],
  );

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
              handleCheckedChange={() => {
                window.config.set("sidebar.display.showGameCount", !showGameCount);
                setShowGameCount((prev) => !prev);
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
