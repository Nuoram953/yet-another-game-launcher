import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className = "" }: SectionProps) => {
  return <section className={`w-full p-4 ${className}`}>{children}</section>;
};

export default Section;
