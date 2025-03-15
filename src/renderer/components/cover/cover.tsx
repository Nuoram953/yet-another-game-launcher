import React, { useState } from "react";

export const ImageWithFallback = ({ src, alt, style, className }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        ...style,
        display: "block",
        backgroundColor: hasError ? "grey" : "transparent",
      }}
      className="rounded-xl rounded-b-none w-full"
    >
      {!hasError && (
        <img
          src={src}
          alt={alt}
          style={{ display: "block", ...style }}
          onError={() => setHasError(true)}
          className={"rounded-xl w-full " + className}
        />
      )}
    </div>
  );
};
