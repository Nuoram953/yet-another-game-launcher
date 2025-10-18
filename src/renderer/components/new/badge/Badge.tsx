import { VariantProps, cva } from "class-variance-authority";

const badge = cva(["w-fit border border-2 rounded-md py-1 px-2 text-design-white"], {
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});

export interface BadgeProps extends VariantProps<typeof badge> {
  text: string;
  className?: string;
}

export const Badge = ({ text, className }: BadgeProps) => {
  return <div className={badge({ className })}>{text}</div>;
};
