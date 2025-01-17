import { ArrowDownToLine } from "lucide-react";
import { Badge } from "../ui/badge";
import React from "react";

interface Props {
  handleOnClick:(e:React.MouseEvent<HTMLDivElement>)=>void
}

export const InstallBadge = ({handleOnClick}:Props) => {
  return (
    <div className="absolute bottom-16 right-2" onClick={handleOnClick}>
      <Badge variant={"default"} className={`bg-gray-600 shadow-md`}>
        <ArrowDownToLine color="white" size={20} />
      </Badge>
    </div>
  );
};
