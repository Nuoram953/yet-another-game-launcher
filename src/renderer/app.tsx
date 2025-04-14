import * as ReactDOM from "react-dom/client";
import React, { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { GamesProvider } from "./context/DatabaseContext";
import GameDetail from "./pages/detail/Index";
import { BreadcrumbContext } from "./context/BreadcrumbsContext";
import { Breadcrumb } from "./types";
import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Toaster } from "./components/ui/toaster";
import WebsiteViewer from "./pages/web/Index";
import { NotificationProvider } from "./components/NotificationSystem";
import DownloadViewer from "./pages/download/Index";
import { Grid } from "./pages/grid/Index";
import NotificationSystem from "./components/NotificationProvider";

const App = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
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
                      <Grid />
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
      </NotificationProvider>
    </I18nextProvider>
  );
};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app")!);
  root.render(<App />);
}

render();
