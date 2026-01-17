import { Header } from "@render/feature/header";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Header stays on top */}
      <Header />

      {/* Scrollable content */}
      <main className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent absolute bottom-0 left-0 right-0 top-[50px] overflow-y-hidden">
        {children}
      </main>
    </div>
  );
}
