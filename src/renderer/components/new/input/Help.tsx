type HelpProps = {} & React.PropsWithChildren;

export const Help = ({ children }: HelpProps) => {
  return <span className="text-sm text-subtle">{children}</span>;
};
