import * as ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Grid from "./components/layout/Grid";
import Layout from "./components/layout/Layout";
import { LibraryContext } from "./context/DatabaseContext";
import GameDetail from "./pages/GameDetail";
import { Game } from "@prisma/client";
import { BreadcrumbContext } from "./context/BreadcrumbsContext";
import { Breadcrumb } from "./types";

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
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      <LibraryContext.Provider value={{ games, setGames }}>
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
      </LibraryContext.Provider>
    </BreadcrumbContext.Provider>
  );
};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
