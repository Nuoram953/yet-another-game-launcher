import i18next from "i18next";
const Backend = require("i18next-fs-backend/cjs");
import path from "path";
import { app } from "electron"; // electron app module

export const initMainI18n = async () => {
  const i18n = i18next.createInstance();

  const localesPath = path.join(app.getAppPath(), "public", "locales");

  console.log("Locales path:", localesPath);

  await i18n.use(Backend).init({
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr"],
    ns: ["common", "notification"],
    defaultNS: "common",
    backend: {
      loadPath: path.join(localesPath, "{{lng}}", "{{ns}}.json"),
    },
    debug: true,
  });

  return i18n;
};
