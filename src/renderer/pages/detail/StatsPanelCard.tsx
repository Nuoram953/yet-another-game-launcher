import { useGames } from "@/context/DatabaseContext";
import { Icon } from "lucide-react";
import React from "react";

interface Props {
  label: string;
  detail?: string;
  value:string,
  hide?:boolean
  icon: Icon;
}

export const StatsPanelCard = ({ label, detail, value, hide ,icon: Icon }: Props) => {
  const { selectedGame } = useGames();

  if(hide){
    return
  }

  return (
    <div className="bg-gray-800 flex flex-col flex-grow flex-1 rounded-lg p-4 transform hover:scale-105 transition-all duration-300 justify-center items-start content-center">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 mr-2 text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold">{value}</span>
        {detail && <span className="text-sm text-gray-400">{detail}</span>}
      </div>
    </div>
  );
};
