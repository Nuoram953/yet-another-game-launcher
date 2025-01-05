import * as ReactDOM from "react-dom/client";
import React, { useState } from "react";
import Cover from "./components/Cover";

const App = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center mx-10">
      <div className="flex flex-row flex-wrap gap-2">
        <Cover fileName={"the_last_of_us_part_1.webp"} />
        <Cover fileName={"the_last_of_us_part_1.webp"} />
        <Cover fileName={"the_last_of_us_part_1.webp"} />
        <Cover fileName={"the_last_of_us_part_1.webp"} />
      </div>
    </div>
  </div>
);

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App />);
}

render();
