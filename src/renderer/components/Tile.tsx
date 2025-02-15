import React from "react";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import _ from "lodash";

interface Props {
  title?: string;
  children: React.ReactNode;
}

export const Tile = ({ title, children }: Props) => {
  return (
    <div className="flex-1 flex-grow transform rounded-lg bg-gray-800 p-4">
      <CardHeader>
        {!_.isNil(title) && <CardTitle className="text-white">{title}</CardTitle>}
      </CardHeader>
      <CardContent className="text-white">{children}</CardContent>
    </div>
  );
};

export default Tile;
