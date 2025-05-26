import { Card } from "@render/components/card/Card";
import { Input } from "@render/components/input/Input";
import { Label } from "@render/components/ui/label";
import { Switch } from "@render/components/ui/switch";
import React, { useEffect, useState } from "react";

export const SettingStoreSteam = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("store.steam.enable"));
    };
    fetch();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Enable">
        <div className="flex items-center justify-between">
          <Label htmlFor="borderless" className="flex flex-col">
            <span>Enable Steam integration</span>
            <span className="text-sm text-gray-500">Remove window decorations</span>
          </Label>
          <Switch
            checked={isEnabled}
            onCheckedChange={() => {
              window.config.set("store.steam.enable", !isEnabled);
              setIsEnabled(!isEnabled);
            }}
          />
        </div>
      </Card>
      {isEnabled && (
        <div className="flex flex-col gap-4">
          <Card title="Authentification">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="borderless" className="flex w-3/4 flex-col">
                  <span>Steam API key</span>
                  <span className="text-sm text-gray-500">Remove window decorations</span>
                </Label>
                <Input color={"dark"} placeholder="Enter your Steam API key" value={""} onChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="borderless" className="flex w-3/4 flex-col">
                  <span>Account name</span>
                  <span className="text-sm text-gray-500">
                    Enter a name if you have multipe accout. Leave blank to use default
                  </span>
                </Label>
                <Input color={"dark"} placeholder="Enter your Steam account name" value={""} onChange={() => {}} />
              </div>
            </div>
          </Card>

          <Card title="Global">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="borderless" className="flex flex-col">
                  <span>Installation path</span>
                  <span className="text-sm text-gray-500">
                    Leave blank if you're using the default steam installation path
                  </span>
                </Label>
                <Input color={"dark"} placeholder="Enter your Steam account name" value={""} onChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="borderless" className="flex flex-col">
                  <span>Update played time on refresh</span>
                  <span className="text-sm text-gray-500">Always keep up to date the field played time</span>
                </Label>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => {
                    window.config.set("store.steam.enable", !isEnabled);
                    setIsEnabled(!isEnabled);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
