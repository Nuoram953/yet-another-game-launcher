import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="home-button">
        Go to Homepage
      </Link>

      <style jsx>{`
        .not-found-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        }

        h1 {
          font-size: 72px;
          margin: 0;
          color: #e74c3c;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 24px;
        }

        p {
          margin-bottom: 24px;
        }

        .home-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 0.3s;
        }

        .home-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
}

export default NotFound;
