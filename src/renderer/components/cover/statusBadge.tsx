import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import React from "react";

interface Props {
  status: string;
}

export const StatusBadge = ({ status }: Props) => {
  const { t } = useTranslation("GameStatus");

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      playing: "bg-blue-500",
      played: "bg-yellow-500",
      planned: "bg-purple-500",
      dropped: "bg-red-500",
      completed: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="absolute left-2 top-2">
      <Badge
        variant={"default"}
        className={`${getStatusColor(status)} rounded-xl border-2 border-gray-200 shadow-md`}
      >
        {t(status)}
      </Badge>
    </div>
  );
};
