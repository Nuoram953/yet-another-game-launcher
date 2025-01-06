import * as ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import Cover from "./components/Cover";
import SearchWithFilters from "./components/SearchWithFilters";
import { HashRouter, Route, Routes } from "react-router-dom";
import Grid from "./components/layout/Grid";
import Layout from "./components/layout/Layout";

const App = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const steamGames = await window.api.updateLibraries();

        setGames(steamGames);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  return(
  <HashRouter>
    <Routes>
      <Route
        index
        path="/"
        element={
          <Layout>
            <Grid games={games}/>
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
  )

};

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
