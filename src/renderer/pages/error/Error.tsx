import React from "react";
import { Link } from "react-router-dom";

const ErrorPage500: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-5 text-center dark:bg-slate-900">
      <h1 className="text-design-text-error m-0 text-7xl font-bold">500</h1>
      <h2 className="mb-6 mt-1 text-xl font-semibold text-slate-800">Server Error</h2>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Sorry, something went wrong on our server. We're working to fix the issue.
      </p>
      <Link
        to="/"
        className="rounded-md bg-indigo-500 px-5 py-2 text-design-text-normal no-underline transition-colors hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default ErrorPage500;
