import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WebsiteViewer = ({ url = 'https://store.steampowered.com' }) => {
  const webviewRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const webview = webviewRef.current;

    if (webview) {
      // Loading events
      webview.addEventListener('did-start-loading', () => {
        setIsLoading(true);
      });

      webview.addEventListener('did-finish-load', () => {
        setIsLoading(false);
        setError('');
      });

      // Error handling
      webview.addEventListener('did-fail-load', (event) => {
        setIsLoading(false);
        setError(`Failed to load: ${event.errorDescription}`);
      });

      // Optional: Console logging from the webview
      webview.addEventListener('console-message', (event) => {
        console.log('Webview:', event.message);
      });
    }
  }, []);

  const handleRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  return (
    <div className="w-full h-screen max-h-[600px] flex flex-col relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
          <Alert variant="destructive" className="max-w-md mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      <webview
        ref={webviewRef}
        src={url}
        className="w-full h-full"
        allowpopups="true"
        webpreferences="contextIsolation, javascript=yes"
      />
    </div>
  );
};

export default WebsiteViewer;
