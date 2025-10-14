import { LOCALE_NAMESPACE } from "@common/constant";
import Section from "@render/components/new/section";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React from "react";
import useGameStore from "@render/feature/detail/store/GameStore";

export const LaunchStorefrontSettings = () => {
  const game = useGameStore((state) => state.game);

  return (
    <>
      {game.launchStorefront.map((app) => (
        <Section>
          <Section.Title title={t("storefront." + app.storefront.name, { ns: LOCALE_NAMESPACE.COMMON })} />
          <Section.Content>
            <div className="flex flex-col gap-8">
              <InputSwitch
                title={t("settings.launch.storefront.enable.title", { ns: LOCALE_NAMESPACE.DETAIL, appName: app.name })}
                description={t("settings.launch.storefront.enable.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  appName: t("storefront." + app.storefront.name, { ns: LOCALE_NAMESPACE.COMMON }),
                })}
                value={app.isEnabled}
                handleCheckedChange={() => {}}
              />
            </div>
          </Section.Content>
        </Section>
      ))}
    </>
  );
};
