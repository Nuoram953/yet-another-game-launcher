import { Dialog } from "@render/components/new/popup";
import Section from "@render/components/new/section";
import { Select } from "@render/components/new/select";
import { Plus } from "lucide-react";
import { useEmulator } from "../../api/get-emulators";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useState } from "react";
import { useLaunchEmulator } from "../../api/post-launch-emulator";
import useGameStore from "@render/feature/detail/store/GameStore";
import { t } from "i18next";

export const AddPopup = () => {
  const game = useGameStore((state) => state.game);
  const [emulator, setEmulator] = useState("");
  const emulatorQuery = useEmulator();

  const createLaunchEmulator = useLaunchEmulator({
    data: {},
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  return (
    <Section>
      <Section.Content>
        <Dialog>
          <Dialog.Trigger asChild>
            <div className="flex w-full cursor-pointer flex-col items-center gap-2 border-2 border-dashed border-design-border p-8 py-12 text-center hover:bg-design-background">
              <Plus />
              <span>{t("settings.launch.emulator.add", { ns: LOCALE_NAMESPACE.DETAIL })}</span>
            </div>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>{t("settings.launch.emulator.add", { ns: LOCALE_NAMESPACE.DETAIL })}</Dialog.Title>
            <div className="flex flex-col gap-4">
              <Select value={emulator} onValueChange={setEmulator}>
                <Select.Trigger>
                  <Select.Value placeholder="Select Emulator" />
                </Select.Trigger>
                <Select.Content>
                  {emulatorQuery.data?.map((emulator) => (
                    <Select.Item value={String(emulator.id)}>{emulator.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <Dialog.Footer>
              <Dialog.NegativeAction>Cancel</Dialog.NegativeAction>
              <Dialog.PositiveAction
                onClick={() => {
                  createLaunchEmulator.mutate({
                    gameId: game.id,
                    isEnabled: true,
                    emulatorId: Number(emulator),
                    retroAchievementsId: null,
                    name: "Test",
                    path: "",
                  });
                }}
              >
                Add
              </Dialog.PositiveAction>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Section.Content>
    </Section>
  );
};
