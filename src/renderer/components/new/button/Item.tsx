import React from "react";

interface ItemProps {
  children: React.ReactNode;
  position?: "left" | "right";
}

const Item = ({ children, position = "left" }: ItemProps) => {
  const marginClass = position === "left" ? "mr-2" : "ml-2";
  return <span className={`flex items-center ${marginClass}`}>{children}</span>;
};

export default Item;
