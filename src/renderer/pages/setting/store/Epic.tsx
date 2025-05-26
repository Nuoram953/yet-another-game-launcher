import { Card } from "@render/components/card/Card";
import { Label } from "@render/components/ui/label";
import { Switch } from "@render/components/ui/switch";
import React, { useEffect, useState } from "react";

export const SettingStoreEpic = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsEnabled(await window.config.get("store.epic.enable"));
    };
    fetch();
  }, []);

  return (
    <Card title="">
      <div className="flex items-center justify-between">
        <Label htmlFor="borderless" className="flex flex-col">
          <span>Enable Epic Game Store integration</span>
          <span className="text-sm text-gray-500">Remove window decorations</span>
        </Label>
        <Switch
          checked={isEnabled}
          onCheckedChange={() => {
            window.config.set("store.epic.enable", !isEnabled);
            setIsEnabled(!isEnabled);
          }}
        />
      </div>
    </Card>
  );
};
