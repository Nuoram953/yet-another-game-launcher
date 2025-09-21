import React from "react";

interface Props {
  children: React.ReactNode;
}

export const Container = ({ children }: Props) => {
  return (
    <div
      className={`relative z-20 mx-auto flex max-w-[1920px] flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden`}
    >
      {children}
    </div>
  );
};

export const Column = ({ children }: Props) => {
  return <div className={`flex flex-col gap-16 overflow-hidden`}>{children}</div>;
};

export const Row = ({ children }: Props) => {
  return <div className={`flex flex-row items-center justify-around gap-4`}>{children}</div>;
};

interface IconAndTextProps {
  icon: React.ReactNode;
  text: string;
}

export const IconAndText = ({ icon, text }: IconAndTextProps) => {
  return (
    <div className={`flex flex-row items-center gap-2`}>
      <>{icon}</>
      <p>{text}</p>
    </div>
  );
};
