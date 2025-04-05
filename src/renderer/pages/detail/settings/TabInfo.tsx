import { Input } from "@/components/input/Input";
import { useGames } from "@/context/DatabaseContext";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export const TabInfo = () => {
  const { selectedGame } = useGames();

  if (_.isNil(selectedGame)) {
    return <>...Loading</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" color="dark" value={selectedGame.name} />
      <div className="w-full flex flex-row gap-2">
        <Input label="Id" color="dark" value={selectedGame.id} disabled={true}/>
        <Input label="External Id" color="dark" value={String(selectedGame.externalId)} disabled={true} />
      </div>
    </div>
  );
};
