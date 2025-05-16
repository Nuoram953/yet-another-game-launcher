import axios from "axios";
import logger, { LogTag } from "@main/logger";

axios.interceptors.request.use(
  (config) => {
    logger.info("Request Input:", { url: config.url }, LogTag.NETWORK);
    return config;
  },
  (error) => {
    logger.error("Request Error:", { error }, LogTag.NETWORK);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    logger.info(
      `Request Output:`,
      {
        url: response.config.url,
        status: response.status,
      },
      LogTag.NETWORK,
    );
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(
        `Response Error from ${error.response.config.url}:`,
        {
          url: error.response.config.url,
          error: error.message,
          status: error.response.status,
        },
        LogTag.NETWORK,
      );
    } else {
      logger.error("Response Error:", { error: error.message }, LogTag.NETWORK);
    }
    return Promise.reject(error);
  },
);

export default axios;
