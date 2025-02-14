import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGames } from "@/context/DatabaseContext";
import { GameConfigGamescope } from "@prisma/client";

const GameScopeSettings = () => {
  const { selectedGame } = useGames();
  const isFirstRender = useRef(true); // Track initial render
  const [settings, setSettings] = React.useState<GameConfigGamescope>(
    selectedGame?.gamescope ?? {
      id: "",
      gameId: selectedGame!.id,
      isEnabled: false,
      isBorderless: false,
      isFullscreen: false,
      isFsr: false,
      isAllowUnfocused: false,
      isEnableSteamOverlay: false,
      isForceGrabCursor: false,
      width: 1920,
      height: 1080,
      refreshRate: 144,
    },
  );

  const handleChange = async () => {
    await window.game.setGamescope({
      id: "",
      gameId: selectedGame!.id,
      isEnabled: settings.isEnabled,
      isBorderless: settings.isBorderless,
      isFullscreen: settings.isFullscreen,
      isFsr: settings.isFsr,
      isAllowUnfocused: settings.isAllowUnfocused,
      isEnableSteamOverlay: settings.isEnableSteamOverlay,
      isForceGrabCursor: settings.isForceGrabCursor,
      width: settings.width,
      height: settings.height,
      refreshRate: settings.refreshRate,
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as not first render
      return;
    }
    handleChange();
  }, [settings]); // Runs whenever state changes, but skips the first time

  const handleSwitchChange = async (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setSettings((prev) => ({
      ...prev,
      [dimension]: value,
    }));
    handleChange();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl">Gamescope</CardTitle>
        <Switch
          checked={settings.isEnabled}
          onCheckedChange={() => handleSwitchChange("isEnabled")}
        />
      </CardHeader>
      {settings.isEnabled && (
        <CardContent className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="borderless" className="flex flex-col">
                <span>Borderless</span>
                <span className="text-sm text-gray-500">
                  Remove window decorations
                </span>
              </Label>
              <Switch
                id="borderless"
                checked={settings.isBorderless}
                onCheckedChange={() => handleSwitchChange("isBorderless")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="fullscreen" className="flex flex-col">
                <span>Fullscreen</span>
                <span className="text-sm text-gray-500">
                  Force fullscreen mode
                </span>
              </Label>
              <Switch
                id="fullscreen"
                checked={settings.isFullscreen}
                onCheckedChange={() => handleSwitchChange("fullscreen")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="noFSR" className="flex flex-col">
                <span>Enable FSR</span>
                <span className="text-sm text-gray-500">
                  Disable FidelityFX Super Resolution
                </span>
              </Label>
              <Switch
                id="noFSR"
                checked={settings.isFsr}
                onCheckedChange={() => handleSwitchChange("noFSR")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="unfocused" className="flex flex-col">
                <span>Allow Unfocused</span>
                <span className="text-sm text-gray-500">
                  Continue rendering when unfocused
                </span>
              </Label>
              <Switch
                id="unfocused"
                checked={settings.isAllowUnfocused}
                onCheckedChange={() => handleSwitchChange("unfocused")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="unfocused" className="flex flex-col">
                <span>Enable Steam overlay</span>
                <span className="text-sm text-gray-500">
                  Show Steam overlay while in game
                </span>
              </Label>
              <Switch
                id="unfocused"
                checked={settings.isEnableSteamOverlay}
                onCheckedChange={() => handleSwitchChange("steamOverlay")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="unfocused" className="flex flex-col">
                <span>Force grab cursos</span>
                <span className="text-sm text-gray-500">
                  Show Steam overlay while in game
                </span>
              </Label>
              <Switch
                id="unfocused"
                checked={settings.isForceGrabCursor}
                onCheckedChange={() => handleSwitchChange("steamOverlay")}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={settings.width}
                  onChange={(e) =>
                    handleDimensionChange("width", e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={settings.height}
                  onChange={(e) =>
                    handleDimensionChange("height", e.target.value)
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Refresh rate</Label>
              <Input
                id="width"
                type="number"
                value={settings.refreshRate}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default GameScopeSettings;
