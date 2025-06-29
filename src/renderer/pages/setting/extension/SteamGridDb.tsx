import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";

export const SettingExtensionSteamGridDb = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("extension.steamGridDb.enable"));
      setKey(await window.config.get("extension.steamGridDb.apiKey"));
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
      <Card title={t("extension.steamGridDb.sectionTitles.enable", { ns: LOCALE_NAMESPACE.SETTINGS })}>
        <InputSwitch
          title={t("extension.steamGridDb.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
          description={t("extension.steamGridDb.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
          value={isEnabled}
          handleCheckedChange={() => {
            window.config.set("extension.steamGridDb.enable", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </Card>

      {isEnabled && (
        <div className="flex flex-col gap-4">
          <Card title={t("extension.steamGridDb.sectionTitles.authentication", { ns: LOCALE_NAMESPACE.SETTINGS })}>
            <div className="flex flex-col gap-8">
              <InputText
                title={t("extension.steamGridDb.apiKey.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                description={t("extension.steamGridDb.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputOnChange={(e) => {
                  debouncedSetPath("extension.steamGridDb.apiKey", e.target.value);
                  setKey(e.target.value);
                }}
                inputPlaceholder={t("extension.steamGridDb.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputValue={key}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
