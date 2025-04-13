import React from "react";

interface Props {
  children: React.ReactNode;
}

export const Container = ({ children }: Props) => {
  return (
    <div
      className={`relative z-20 mx-auto w-full max-w-[1500px] flex-1 overflow-y-auto p-2 px-4 sm:px-6 lg:px-8`}
    >
      {children}
    </div>
  );
};
