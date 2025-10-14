import { LOCALE_NAMESPACE } from "@common/constant";
import Section from "@render/components/new/section";
import useGameStore from "@render/feature/detail/store/GameStore";
import { InputSwitch } from "@render/pages/detail/settings/Input";
import { t } from "i18next";
import _ from "lodash";
import React from "react";
import { GameLaunchEmulation } from "@prisma/client";
import Input from "@render/components/new/input/TextInput";
import { Divider } from "@render/components/new/divider/Divider";
import { LaunchType } from "@common/types";
import { AddPopup } from "./AddPopup";
import { useLaunchEmulator } from "../../api/post-launch-emulator";
import { DeletePopup } from "../DeletePopup";

export const LaunchEmulatorSettings = () => {
  const game = useGameStore((state) => state.game);

  const createLaunchEmulator = useLaunchEmulator({
    data: {},
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const handleUpdate = (emulator: Partial<GameLaunchEmulation>) => {
    createLaunchEmulator.mutate({
      id: emulator.id,
      name: emulator.name,
      gameId: emulator.gameId,
      isEnabled: emulator.isEnabled,
      path: emulator.path,
      retroAchievementsId: emulator.retroAchievementsId,
    });
  };

  return (
    <>
      {game.launchEmulation.map((emulation) => (
        <Section>
          <Section.Title title={emulation.name}></Section.Title>
          <Section.Content>
            <div className="flex flex-col gap-8">
              <InputSwitch
                title={t("settings.launch.emulator.enable.title", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  appName: emulation.name,
                })}
                description={t("settings.launch.emulator.enable.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                value={emulation.isEnabled}
                handleCheckedChange={() => {
                  handleUpdate({ ...emulation, isEnabled: !emulation.isEnabled });
                }}
              />

              <Input
                label={t("settings.launch.emulator.name.title", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                value={emulation.name}
                placeholder={t("settings.launch.emulator.name.placeholder", { ns: LOCALE_NAMESPACE.DETAIL })}
                helperText={t("settings.launch.emulator.name.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                onChange={(e) => {
                  handleUpdate({ ...emulation, name: e.target.value });
                }}
              />

              <Input
                label={t("settings.launch.emulator.path.title", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  appName: emulation.name,
                })}
                helperText={t("settings.launch.emulator.path.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                  emulatorName: emulation.name,
                })}
                type={_.isNil(emulation.path) ? "file" : "text"}
                onChange={(e) => {
                  handleUpdate({ ...emulation, path: e.target.value });
                }}
                placeholder={t("settings.launch.emulator.path.placeholder", { ns: LOCALE_NAMESPACE.DETAIL })}
                value={emulation.path}
              />

              <Input
                label={t("settings.launch.emulator.retroAchievement.title", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                helperText={t("settings.launch.emulator.retroAchievement.description", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                onChange={(e) => {
                  handleUpdate({ ...emulation, retroAchievementsId: e.target.value });
                }}
                placeholder={t("settings.launch.emulator.retroAchievement.placeholder", {
                  ns: LOCALE_NAMESPACE.DETAIL,
                })}
                value={emulation.retroAchievementsId}
              />
            </div>

            <div className="mt-8">
              <Divider color="gray" />
              <div className="flex justify-start"></div>
              <DeletePopup type={LaunchType.EMULATOR} launchId={emulation.id} />
            </div>
          </Section.Content>
        </Section>
      ))}

      <AddPopup />
    </>
  );
};
