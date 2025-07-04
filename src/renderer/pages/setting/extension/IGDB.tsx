import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";

export const SettingExtensionIGDB = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("extension.igdb.enable"));
      setClientId(await window.config.get("extension.igdb.clientId"));
      setClientSecret(await window.config.get("extension.igdb.clientSecret"));
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
      <Card title={t("extension.igdb.sectionTitles.enable", { ns: LOCALE_NAMESPACE.SETTINGS })}>
        <InputSwitch
          title={t("extension.igdb.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
          description={t("extension.igdb.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
          value={isEnabled}
          handleCheckedChange={() => {
            window.config.set("extension.igdb.enable", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </Card>

      {isEnabled && (
        <div className="flex flex-col gap-4">
          <Card title={t("extension.igdb.sectionTitles.authentication", { ns: LOCALE_NAMESPACE.SETTINGS })}>
            <div className="flex flex-col gap-8">
              <InputText
                title={t("extension.igdb.clientId.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                description={t("extension.igdb.clientId.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputOnChange={(e) => {
                  debouncedSetPath("extension.igdb.clientId", e.target.value);
                  setClientId(e.target.value);
                }}
                inputPlaceholder={t("extension.igdb.clientId.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputValue={clientId}
              />

              <InputText
                title={t("extension.igdb.clientSecret.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                description={t("extension.igdb.clientSecret.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputOnChange={(e) => {
                  debouncedSetPath("extension.igdb.clientSecret", e.target.value);
                  setClientSecret(e.target.value);
                }}
                inputPlaceholder={t("extension.igdb.clientSecret.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputValue={clientSecret}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
