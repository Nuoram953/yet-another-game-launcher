type LabelProps = {} & React.PropsWithChildren;

export const Label = ({ children }: LabelProps) => {
  return <label>{children}</label>;
};
