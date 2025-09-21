import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import Section from "@render/components/new/section";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const SettingExtensionHowLongToBeat = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("extension.howLongToBeat.enable"));
    };
    fetch();
  }, []);

  return (
    <>
      <Section>
        <Section.Title title={t("extension.howLongToBeat.sectionTitles.enable", { ns: LOCALE_NAMESPACE.SETTINGS })} />
        <Section.Content>
          <div className="flex flex-col gap-8">
            <InputSwitch
              title={t("extension.howLongToBeat.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
              description={t("extension.howLongToBeat.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
              value={isEnabled}
              handleCheckedChange={() => {
                window.config.set("extension.howLongToBeat.enable", !isEnabled);
                setIsEnabled(!isEnabled);
              }}
            />
          </div>
        </Section.Content>
      </Section>
    </>
  );
};
