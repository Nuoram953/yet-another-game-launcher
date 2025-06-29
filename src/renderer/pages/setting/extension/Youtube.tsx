import { LOCALE_NAMESPACE } from "@common/constant";
import { Button } from "@render/components/button/Button";
import { Card } from "@render/components/card/Card";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import { File } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export const SettingExtensionYoutube = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [ytDlpPath, setYtDlpPath] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("extension.youtube.enable"));
      setYtDlpPath(await window.config.get("extension.youtube.ytDlpPath"));
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
      <Card title={t("extension.youtube.sectionTitles.enable", { ns: LOCALE_NAMESPACE.SETTINGS })}>
        <InputSwitch
          title={t("extension.youtube.enable.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
          description={t("extension.youtube.enable.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
          value={isEnabled}
          handleCheckedChange={() => {
            window.config.set("extension.youtube.enable", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </Card>
      {isEnabled && (
        <div className="flex flex-col gap-4">
          <Card title={t("extension.youtube.sectionTitles.ytDlp", { ns: LOCALE_NAMESPACE.SETTINGS })}>
            <div className="flex flex-col gap-4">
              <InputText
                title={t("extension.youtube.ytDlp.title", { ns: LOCALE_NAMESPACE.SETTINGS })}
                description={t("extension.youtube.ytDlp.description", { ns: LOCALE_NAMESPACE.SETTINGS })}
                inputValue={ytDlpPath}
                inputOnChange={(e) => setYtDlpPath(e.target.files?.[0].name || null)}
                inputPlaceholder={""}
                actionRight={
                  <Button
                    icon={File}
                    size="fit"
                    intent="icon"
                    onClick={async () => {
                      const path = await window.dialog.open();
                      window.config.set("extension.youtube.ytDlpPath", path);
                      setYtDlpPath(path);
                    }}
                  />
                }
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
