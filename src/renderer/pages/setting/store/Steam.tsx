import { Card } from "@render/components/card/Card";
import { Input } from "@render/components/input/Input";
import { Label } from "@render/components/ui/label";
import { Switch } from "@render/components/ui/switch";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
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
    <div className="flex flex-col gap-4">
      <Card title="Enable">
        <InputSwitch
          title={"Enable Steam integration"}
          description={"Enable or disable Steam integration in the application."}
          value={isEnabled}
          handleCheckedChange={() => {
            window.config.set("store.steam.enable", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </Card>
      {isEnabled && (
        <div className="flex flex-col gap-4">
          <Card title="Authentification">
            <div className="flex flex-col gap-8">
              <InputText
                title={"Steam API key"}
                description={
                  " To use Steam integration, you need to provide your Steam API key. You can get it from the Steam developer portal."
                }
                inputOnChange={(e) => {
                  debouncedSetPath("store.steam.apiKey", e.target.value);
                  setKey(e.target.value);
                }}
                inputPlaceholder={"Enter your Steam API key"}
                inputValue={key}
              />

              <InputText
                title={"Account name"}
                description={" Enter a name if you have multipe accout. Leave blank to use default "}
                inputOnChange={(e) => {
                  debouncedSetPath("store.steam.accountName", e.target.value);
                  setAccountName(e.target.value);
                }}
                inputPlaceholder={"Enter your Steam account name"}
                inputValue={accountName}
              />
            </div>
          </Card>

          <Card title="Global">
            <div className="flex flex-col gap-4">
              <InputSwitch
                title={"Custom installation path"}
                description={"Leave off if you're using the default steam installation path"}
                value={isCustomPathEnabled}
                handleCheckedChange={() => {
                  setIsCustomPathEnabled(!isCustomPathEnabled);
                }}
                inputPlaceholder="Enter your Steam installation path"
                inputValue={customPath}
                inputOnChange={(e) => {
                  debouncedSetPath("store.steam.isntallationPath", e.target.value);
                  setCustomPath(e.target.value);
                }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
