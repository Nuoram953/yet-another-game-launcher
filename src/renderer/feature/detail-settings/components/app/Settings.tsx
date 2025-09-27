import { LOCALE_NAMESPACE } from "@common/constant";
import Section from "@render/components/new/section";
import { InputSwitch, InputText } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React, { useCallback } from "react";
import useGameStore from "@render/feature/detail/store/GameStore";
import { GameLaunchApp } from "@prisma/client";
import { useLaunchApp } from "../../api/post-launch-app";
import { AddPopup } from "./AddPopup";
import { Divider } from "@render/components/new/divider/Divider";
import { DeletePopup } from "../DeletePopup";
import { LaunchType } from "@common/types";

export const LaunchAppSettings = () => {
  const game = useGameStore((state) => state.game);

  const createLaunchApp = useLaunchApp({
    gameId: game.id,
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const handleUpdate = (app: Partial<GameLaunchApp>) => {
    createLaunchApp.mutate({
      id: app.id,
      name: app.name,
      gameId: app.gameId,
      isEnabled: app.isEnabled,
      path: app.path,
    });
  };

  return (
    <>
      {game.launchApp.map((app) => (
        <Section>
          <Section.Title title={app.name} />
          <Section.Content>
            <div className="flex flex-col gap-8">
              <InputSwitch
                title={t("settings.launch.app.enable.title", { ns: LOCALE_NAMESPACE.DETAIL, appName: app.name })}
                description={t("settings.launch.app.enable.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  appName: app.name,
                })}
                value={app.isEnabled}
                handleCheckedChange={() => {
                  handleUpdate({ ...app, isEnabled: !app.isEnabled });
                }}
              />

              <InputText
                title={t("settings.launch.app.path.title", { ns: LOCALE_NAMESPACE.DETAIL, appName: app.name })}
                description={t("settings.launch.app.path.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  appName: app.name,
                })}
                inputOnChange={(e) => {
                  handleUpdate({ ...app, path: e.target.value });
                }}
                inputPlaceholder={t("settings.launch.app.path.placeholder", { ns: LOCALE_NAMESPACE.DETAIL })}
                inputValue={app.path}
              />
            </div>

            <div className="mt-8">
              <Divider color="gray" />
              <div className="flex justify-start"></div>
              <DeletePopup type={LaunchType.APP} launchId={app.id} />
            </div>
          </Section.Content>
        </Section>
      ))}

      <AddPopup />
    </>
  );
};
