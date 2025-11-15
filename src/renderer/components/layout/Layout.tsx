import React from "react";
import { Sidebar } from "@render/feature/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="z-0 flex min-h-0 flex-1 flex-col bg-background">
        <header className="absolute left-7 top-2 flex w-full shrink-0 items-center gap-2 text-normal">
          <div className="z-[1000] flex items-center gap-2 px-4"></div>
        </header>

        <div className="">{children}</div>
      </main>
    </div>
  );
}
