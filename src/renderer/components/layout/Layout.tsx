import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);

  useEffect(() => {
    window.api.onReceiveFromMain("is-game-running", (isRunning: boolean) => {
      setIsGameRunning(isRunning);
    });
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full bg-gray-100">
        {isGameRunning ? (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components and dependencies to your app using the cli.
            </AlertDescription>
          </Alert>
        ) : (
          ""
        )}
        {children}
      </main>
    </SidebarProvider>
  );
}
