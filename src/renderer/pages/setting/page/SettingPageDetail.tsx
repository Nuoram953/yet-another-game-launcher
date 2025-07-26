import { LOCALE_NAMESPACE } from "@common/constant";
import { useConfig } from "@render/components/ConfigProvider";
import { Card } from "@render/components/card/Card";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const SettingPageGameDetails = () => {
  const { setConfigValue, getConfigValue } = useConfig();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await getConfigValue("page.detail.review.blurExternalReviews"));
    };
    fetch();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card title={t("page.sectionTitles.reviews", { ns: LOCALE_NAMESPACE.SETTINGS })}>
        <InputSwitch
          title={t("page.reviews.blurExternalReviews.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
          description={t("page.reviews.blurExternalReviews.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
          value={isEnabled}
          handleCheckedChange={() => {
            setConfigValue("page.detail.review.blurExternalReviews", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </Card>
    </div>
  );
};
