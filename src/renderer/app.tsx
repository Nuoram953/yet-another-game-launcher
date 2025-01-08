import * as ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import Cover from "./components/Cover";
import SearchWithFilters from "./components/SearchWithFilters";
import { HashRouter, Route, Routes } from "react-router-dom";
import Grid from "./components/layout/Grid";
import Layout from "./components/layout/Layout";
import { ipcMain } from "electron";
import { IGame } from "src/common/types";
import { LibraryContext, LibraryContextType } from "./context/DatabaseContext";

const App = () => {
  const [games, setGames] = useState<IGame[]>([]);

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
    window.api.onReceiveFromMain("add-new-game", (newGame: IGame) => {
      setGames((prevItems) => [...prevItems, newGame]);
    });
  }, []);

  return (
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
                <p>test</p>
              </Layout>
            }
          />
        </Routes>
      </HashRouter>
    </LibraryContext.Provider>
  );
};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
