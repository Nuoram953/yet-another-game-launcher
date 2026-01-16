import { VariantProps, cva } from "class-variance-authority";

export const InuptVariants = cva(
  [
    "flex items-center justify-center gap-2 rounded-md font-medium transition bg-gray-700",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder:text-placeholder",
  ],
  {
    variants: {
      size: {
        xs: "px-1.5 py-2 text-xs",
        sm: "px-2 py-2.5 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-6 py-4 text-lg",
      },
    },
    compoundVariants: [],
    defaultVariants: {
      size: "sm",
    },
  },
);

export type InputBaseProps = VariantProps<typeof InuptVariants> &
  React.InputHTMLAttributes<HTMLInputElement> & {
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    className?: string;
  };

export const InputBase = ({ size, leading, trailing, className, ...props }: InputBaseProps) => {
  return (
    <>
      {leading}
      <input className={InuptVariants({ size, className })} {...props} />
      {trailing}
    </>
  );
};
