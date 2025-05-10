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
import { RankingPage } from "./pages/ranking/Index";
import { RankingEditPage } from "./pages/ranking/edit/Index";
import NotFound from "./pages/error/notFound";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

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
                  path="/ranking"
                  element={
                    <Layout>
                      <RankingPage />
                    </Layout>
                  }
                />

                <Route
                  index
                  path="/ranking/:id"
                  element={
                    <Layout>
                      <RankingEditPage />
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
                <Route
                  path="*"
                  element={
                    <Layout>
                      <NotFound />
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
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}

render();
