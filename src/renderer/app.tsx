import * as ReactDOM from "react-dom/client";
import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { router } from "./router";
import { GamesProvider } from "./context/DatabaseContext";
import { NotificationProvider } from "./components/NotificationSystem";
import NotificationSystem from "./components/NotificationProvider";
import { ThemeProvider } from "./components/theme-provider";
import { ConfigProvider } from "./components/ConfigProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";

import "./index.css";
import "./design-tokens.css";
import "./i18n";
import { queryConfig } from "./lib/react-query";

const queryClient = new QueryClient({ defaultOptions: queryConfig });

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ConfigProvider>
          <NotificationProvider>
            <NotificationSystem />
            <GamesProvider>
              <I18nextProvider i18n={i18n}>
                <RouterProvider router={router} />
              </I18nextProvider>
              <Toaster />
            </GamesProvider>
          </NotificationProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app")!);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
