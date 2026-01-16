import React from "react";

type FooterProps = { hideBorder?: boolean } & React.PropsWithChildren;

const Footer = ({ children, hideBorder = false }: FooterProps) => (
  <div className={`mt-6 ${!hideBorder && "border-t border-gray-700"} pt-4`}>{children}</div>
);

export default Footer;
