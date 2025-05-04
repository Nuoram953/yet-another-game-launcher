import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full border-4 border-white border-t-transparent"></div>
    </div>
  );
};

export default Spinner;
