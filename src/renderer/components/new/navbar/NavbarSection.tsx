import * as React from "react";

export const NavbarSection = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-10 flex">{children}</div>
);
