import * as ReactDOM from "react-dom/client";
import React, { useState } from "react";
import Cover from "./components/Cover";
import SearchWithFilters from "./components/SearchWithFilters";
import { HashRouter, Route, Routes } from "react-router-dom";
import Grid from "./components/layout/Grid";
import Layout from "./components/layout/Layout";

const App = () => (
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
);

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
