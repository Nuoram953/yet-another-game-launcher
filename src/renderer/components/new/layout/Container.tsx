import { Header } from "@render/feature/header";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent h-full w-full overflow-y-auto bg-background">
      <Header />
      {children}
    </div>
  );
}
