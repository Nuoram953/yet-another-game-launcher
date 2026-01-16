import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
};

export function LoadingCenter({ className }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <Loader2 className="size-12 animate-spin text-normal" />
    </div>
  );
}
