import i18next from "i18next";
import path from "path";

const Backend = require('i18next-fs-backend/cjs');

const i18nConfig = {
  fallbackLng: "en",
  supportedLngs: ["en", "es", "fr"],
  ns: ["common", "notification" ],
  defaultNS: "common",
};

export const initMainI18n = async () => {
  const i18n = i18next.createInstance();
  await i18n.use(Backend).init({
    ...i18nConfig,
    backend: {
      loadPath: path.join(__dirname, "locale/{{lng}}/{{ns}}.json"),
    },
    debug: false
  });
  return i18n;
};
