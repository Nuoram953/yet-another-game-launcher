import * as ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { GamesProvider, useGames } from "./context/DatabaseContext";
import GameDetail from "./pages/detail/Index";
import { Game } from "@prisma/client";
import { BreadcrumbContext } from "./context/BreadcrumbsContext";
import { Breadcrumb } from "./types";
import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Toaster } from "./components/ui/toaster";
import WebsiteViewer from "./pages/web/Index";
import NotificationSystem from "./components/NotificationSystem";
import DownloadViewer from "./pages/download/Index";
import { Grid } from "./pages/grid/Index";

const App = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationSystem />
      <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
        <GamesProvider>
          <HashRouter>
            <Routes>
              <Route
                index
                path="/"
                element={
                  <Layout>
                    <Grid/>
                  </Layout>
                }
              />
              <Route
                index
                path="/game/:id"
                element={
                  <Layout>
                    <GameDetail />
                  </Layout>
                }
              />

              <Route
                index
                path="/download"
                element={
                  <Layout>
                    <DownloadViewer />
                  </Layout>
                }
              />

              <Route
                index
                path="/web"
                element={
                  <Layout>
                    <WebsiteViewer />
                  </Layout>
                }
              />
            </Routes>
          </HashRouter>
          <Toaster />
        </GamesProvider>
      </BreadcrumbContext.Provider>
    </I18nextProvider>
  );
};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
