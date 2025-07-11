import { Button } from "@render/components/button/Button";
import { Card } from "@render/components/card/Card";
import { ColorPicker } from "@render/components/input/Color";
import { useColors } from "@render/context/ColorContext";
import _ from "lodash";
import { RotateCcw } from "lucide-react";
import React from "react";

export const SettingApperanceColors = () => {
  const { defaultColors, updateColor, resetColor, getCurrentColor, userColors } = useColors();

  const groupedColors = _.groupBy(Object.entries(defaultColors), ([key]) => key.split("-")[0]);

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedColors).map(([group, entries]) => (
        <Card key={group} title={group[0].toUpperCase() + group.slice(1)} className="p-4">
          <div className="flex flex-col gap-2">
            {entries.map(([key, _]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex-1">{key}</div>
                <div className="flex gap-2">
                  <ColorPicker value={getCurrentColor(key)} onChange={(newColor) => updateColor(key, newColor)} />
                  {key in userColors && <Button intent="icon" icon={RotateCcw} onClick={() => resetColor(key)} />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
