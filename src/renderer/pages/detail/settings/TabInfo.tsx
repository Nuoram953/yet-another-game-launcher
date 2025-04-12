import { Input } from "@/components/input/Input";
import { useGames } from "@/context/DatabaseContext";
import { unixToYYYYMMDD } from "@/utils/util";
import _ from "lodash";
import React from "react";

export const TabInfo = () => {
  const { selectedGame } = useGames();

  if (_.isNil(selectedGame)) {
    return <>...Loading</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" color="dark" value={selectedGame.name} />
      <Input
        label="Summary"
        color="dark"
        type="text"
        className="h-[250px]"
        textarea={true}
        value={selectedGame.summary ?? ""}
      />
      <div className="flex w-full flex-row gap-2">
        <Input
          label="Id"
          color="dark"
          value={selectedGame.id}
          disabled={true}
        />
        <Input
          label="External Id"
          color="dark"
          value={String(selectedGame.externalId)}
          disabled={true}
        />
      </div>
      <div className="flex w-full flex-row gap-2">
        <Input
          label="Score critic"
          color="dark"
          value={String(selectedGame.scoreCritic)}
          type="number"
          min={0}
          max={100}
        />
        <Input
          label="Score community"
          color="dark"
          value={String(selectedGame.scoreCommunity)}
          type="number"
          min={0}
          max={100}
        />
        <Input
          label="Score user"
          color="dark"
          value={String(selectedGame.scoreUser)}
          type="number"
          min={0}
          max={100}
        />
      </div>
      <div className="flex w-full flex-row gap-2">
        <Input
          label="Last time played"
          color="dark"
          value={unixToYYYYMMDD(Number(selectedGame.lastTimePlayed))}
          type="date"
        />
        <Input
          label="Time played"
          color="dark"
          value={selectedGame.timePlayed}
          type="number"
        />
      </div>
    </div>
  );
};
