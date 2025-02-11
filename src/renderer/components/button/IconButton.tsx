import React, { useState } from "react";
import { delay } from "../../../main/utils/utils";
import { LoadingSpinner } from "../LoadingSpinner";

interface Props {
  className?: string;
  size?: number;
  onClick: (e) => void;
  icon: Icon;
}

export const IconButton = ({ className, size, onClick, icon: Icon }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnClick = async (e) => {
    setLoading(true);
    await delay(1000);
    onClick(e);
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Icon
      className={`hover:rounded-md hover:bg-gray-600 ${className}`}
      size={size ?? 18}
      onClick={handleOnClick}
    />
  );
};
