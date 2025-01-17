import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import React from "react";

interface Props {
  status: string;
}

export const StatusBadge = ({ status }: Props) => {
  const { t } = useTranslation("GameStatus");

  const getStatusColor = (status: string) => {
    const colors = {
      playing: "bg-blue-500",
      played: "bg-yellow-500",
      planned: "bg-purple-500",
      dropped: "bg-red-500",
      completed: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="absolute top-2 left-2">
      <Badge
        variant={"default"}
        className={`${getStatusColor(status)} shadow-md`}
      >
        {t(status)}
      </Badge>
    </div>
  );
};
