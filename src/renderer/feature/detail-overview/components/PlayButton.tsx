import { LaunchType } from "@common/types";
import Button from "@render/components/new/button/Button";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { Play } from "lucide-react";

export const PlayButton = () => {
  const { game, isLoading } = useGameFromParams();

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (!game) return;

  const launch = [
    ...game.launchApp
      .filter((launch) => launch.isEnabled)
      .map((launch) => ({
        type: LaunchType.APP,
        ...launch,
      })),
    ...game.launchStorefront
      .filter((launch) => launch.isEnabled)
      .map((launch) => ({
        type: LaunchType.STOREFRONT,
        ...launch,
      })),
    ...game.launchEmulation
      .filter((launch) => launch.isEnabled && !launch.path)
      .map((launch) => ({
        type: LaunchType.EMULATOR,
        ...launch,
      })),
  ];

  return (
    <Button
      intent="custom"
      leadingIcon={<Play />}
      text="Play"
      size={"md"}
      className="bg-green-500 text-white hover:bg-green-600"
      onClick={() => {
        handleOnPlay(LaunchType.EMULATOR, launch.id);
      }}
    />
  );
};
