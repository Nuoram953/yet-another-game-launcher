import { LOCALE_NAMESPACE } from "@common/constant";
import Section from "@render/components/new/section";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";

export const SettingStoreSteam = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCustomPathEnabled, setIsCustomPathEnabled] = useState(false);
  const [customPath, setCustomPath] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("store.steam.enable"));
      setCustomPath(await window.config.get("store.steam.isntallationPath"));
      setIsCustomPathEnabled(customPath !== "" && customPath !== null);
      setKey(await window.config.get("store.steam.apiKey"));
      setAccountName(await window.config.get("store.steam.accountName"));
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
    <>
      <Section>
        <Section.Title title={t("storefront.steam.sectionTitles.global", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("storefront.steam.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("storefront.steam.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={isEnabled}
              handleCheckedChange={() => {
                window.config.set("store.steam.enable", !isEnabled);
                setIsEnabled(!isEnabled);
              }}
            />
          </div>
        </Section.Content>
      </Section>
      {isEnabled && (
        <>
          <Section>
            <Section.Title
              title={t("storefront.steam.sectionTitles.authentication", { ns: LOCALE_NAMESPACE.SETTINGS })}
            />
            <Section.Content>
              <div className="flex flex-col gap-8">
                <InputText
                  title={t("storefront.steam.apiKey.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  description={t("storefront.steam.apiKey.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  inputOnChange={(e) => {
                    debouncedSetPath("store.steam.apiKey", e.target.value);
                    setKey(e.target.value);
                  }}
                  inputPlaceholder={t("storefront.steam.apiKey.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  inputValue={key}
                />

                <InputText
                  title={t("storefront.steam.accountName.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  description={t("storefront.steam.accountName.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  inputOnChange={(e) => {
                    debouncedSetPath("store.steam.accountName", e.target.value);
                    setAccountName(e.target.value);
                  }}
                  inputPlaceholder={t("storefront.steam.accountName.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  inputValue={accountName}
                />
              </div>
            </Section.Content>
          </Section>

          <Section>
            <Section.Title title={t("storefront.steam.sectionTitles.global", { ns: LOCALE_NAMESPACE.SETTINGS })} />
            <Section.Content>
              <div className="flex flex-col gap-8">
                <InputSwitch
                  title={t("storefront.steam.customPath.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  description={t("storefront.steam.customPath.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  value={isCustomPathEnabled}
                  handleCheckedChange={() => {
                    setIsCustomPathEnabled(!isCustomPathEnabled);
                  }}
                  inputPlaceholder={t("storefront.steam.customPath.placeholder", { ns: LOCALE_NAMESPACE.SETTINGS })}
                  inputValue={customPath}
                  inputOnChange={(e) => {
                    debouncedSetPath("store.steam.isntallationPath", e.target.value);
                    setCustomPath(e.target.value);
                  }}
                />
              </div>
            </Section.Content>
          </Section>
        </>
      )}
    </>
  );
};
