import React, { useEffect, useState } from "react";
import { t } from "i18next";
import Section from "@render/components/new/section";
import { LOCALE_NAMESPACE } from "@common/constant";
import { InputSwitch } from "@render/pages/detail/settings/Input";

export const SettingStoreEpic = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("store.epic.enable"));
    };
    fetch();
  }, []);

  return (
    <>
      <Section>
        <Section.Title title={t("storefront.steam.sectionTitles.global", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("storefront.epic.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("storefront.epic.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={isEnabled}
              handleCheckedChange={() => {
                window.config.set("store.epic.enable", !isEnabled);
                setIsEnabled(!isEnabled);
              }}
            />
          </div>
        </Section.Content>
      </Section>
    </>
  );
};
