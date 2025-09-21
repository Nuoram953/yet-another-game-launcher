import { LOCALE_NAMESPACE } from "@common/constant";
import Section from "@render/components/new/section";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const SettingExtensionOpenCritic = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("extension.openCritic.enable"));
    };
    fetch();
  }, []);

  return (
    <>
      <Section>
        <Section.Title title={t("extension.openCritic.sectionTitles.enable", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("extension.openCritic.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("extension.openCritic.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={isEnabled}
              handleCheckedChange={() => {
                window.config.set("extension.openCritic.enable", !isEnabled);
                setIsEnabled(!isEnabled);
              }}
            />
          </div>
        </Section.Content>
      </Section>
    </>
  );
};
