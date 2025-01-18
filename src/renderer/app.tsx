import * as ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Grid from "./components/layout/Grid";
import Layout from "./components/layout/Layout";
import { GamesProvider, LibraryContext } from "./context/DatabaseContext";
import GameDetail from "./pages/GameDetail";
import { Game } from "@prisma/client";
import { BreadcrumbContext } from "./context/BreadcrumbsContext";
import { Breadcrumb } from "./types";
import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import {NotificationProvider} from "./context/NotificationContext";
import { Toaster } from "./components/ui/toaster";

const App = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        setGames(await window.database.getGames());

        window.api.updateLibraries();
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
    window.api.onReceiveFromMain("add-new-game", (newGame: Game) => {
      setGames((prevItems) => [...prevItems, newGame]);
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
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
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
