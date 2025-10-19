import { VariantProps, cva } from "class-variance-authority";

const badge = cva(["w-fit border border-2 rounded-md px-2 py-[2px] text-design-white"], {
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
