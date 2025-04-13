import React, { CSSProperties, useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string|undefined;
  style?: CSSProperties;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  style,
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        ...style,
        display: "block",
        backgroundColor: hasError ? "grey" : "transparent",
      }}
      className="w-full rounded-xl rounded-b-none"
    >
      {!hasError && (
        <img
          src={src}
          alt={alt}
          style={{ display: "block", ...style }}
          onError={() => setHasError(true)}
          className={"w-full rounded-xl " + (className || "")}
        />
      )}
    </div>
  );
};
