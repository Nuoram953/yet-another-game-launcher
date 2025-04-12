import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const WebpageViewer = () => {
  const { setBreadcrumbs } = useBreadcrumbsContext();
  const webviewRef = useRef(null);
  const location = useLocation();
  const { url } = location.state || {};

  useEffect(() => {
    setBreadcrumbs([
      { path: "/", label: "Web" },
      { path: `/web/steam`, label: "Steam" },
    ]);

  }, []);

  return (
    <div className="">
      {url != null && (
        <div className="h-[100vh] w-full overflow-hidden rounded border">
          <webview
            ref={webviewRef}
            src={url}
            className="h-full w-full"
            webpreferences="contextIsolation=true, nodeIntegration=false"
            partition="persist:steamstore"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
            allowpopups={true}
          />
        </div>
      )}
    </div>
  );
};



export default WebpageViewer;
