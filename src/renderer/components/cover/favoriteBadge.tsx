import { Heart } from "lucide-react";
import React from "react";

export const FavoriteBadge = () => {
  return (
    <div className="absolute right-2 top-2">
      <Heart color="red" size={25} fill={"red"} />
    </div>
  );
};
