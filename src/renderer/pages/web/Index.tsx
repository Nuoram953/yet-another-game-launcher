import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const WebpageViewer = () => {
  const { store } = useParams();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    switch (store) {
      case "steam":
        setUrl("https://store.steampowered.com/");
    }
  }, []);

  return (
    <div className="p-4">
      {url != null && (
        <div className="h-96 w-full overflow-hidden rounded border">
          <webview
            src={url}
            className="h-full w-full"
            webpreferences="contextIsolation=true"
          />
        </div>
      )}
    </div>
  );
};

export default WebpageViewer;
