import Button from "@render/components/new/button/Button";
import { Dialog } from "@render/components/new/popup";
import { t } from "i18next";
import Section from "@render/components/new/section";
import useGameStore from "@render/feature/detail/store/GameStore";
import { InputText } from "@render/pages/detail/settings/Input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLaunchApp } from "../../api/post-launch-app";
import { LOCALE_NAMESPACE } from "@common/constant";

export const AddPopup = () => {
  const game = useGameStore((state) => state.game);
  const [inputName, setInputName] = useState("");
  const [inputPath, setInputPath] = useState("");

  const createLaunchApp = useLaunchApp({
    gameId: game.id,
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
              <span>{t("settings.launch.app.add", { ns: LOCALE_NAMESPACE.DETAIL })}</span>
            </div>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>{t("settings.launch.app.add", { ns: LOCALE_NAMESPACE.DETAIL })}</Dialog.Title>
            <div className="flex flex-col gap-4">
              <InputText
                title={"Name"}
                inputOnChange={(e) => {
                  setInputName(e.target.value);
                }}
                inputPlaceholder={"Enter name"}
                inputValue={inputName}
              />

              <InputText
                title={"Path"}
                inputOnChange={(e) => {
                  setInputPath(e.target.value);
                }}
                inputPlaceholder={"Enter path to application"}
                inputValue={inputPath}
              />
            </div>
            <Dialog.Footer>
              <Dialog.NegativeAction>Cancel</Dialog.NegativeAction>
              <Dialog.PositiveAction
                onClick={() => {
                  createLaunchApp.mutate({
                    name: inputName,
                    gameId: game.id,
                    isEnabled: true,
                    path: inputPath,
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
