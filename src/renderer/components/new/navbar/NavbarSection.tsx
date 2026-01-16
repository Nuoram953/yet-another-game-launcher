import * as React from "react";

export const NavbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 flex gap-2">{children}</div>
);
