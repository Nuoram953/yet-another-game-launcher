import { Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import React from "react";

export const FavoriteBadge = () => {
  return (
    <div className="absolute top-2 right-2">
      <Badge variant={"default"} className={`bg-gray-600 shadow-md rounded-full`}>
        <Heart color="red" size={25} fill={"red"} />
      </Badge>
    </div>
  );
};
