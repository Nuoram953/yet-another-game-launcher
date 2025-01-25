import axios from "axios";
import log from "electron-log";

// Configure Axios interceptors
axios.interceptors.request.use(
  (config) => {
    // Log the request URL
    log.info(`Request URL: ${config.url}`);
    return config;
  },
  (error) => {
    // Log the error in case the request fails
    log.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Optional: Log responses as well
axios.interceptors.response.use(
  (response) => {
    log.info(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      log.error(
        `Response Error from ${error.response.config.url}:`,
        error.response.status,
        error.message,
      );
    } else {
      log.error("Response Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default axios;
