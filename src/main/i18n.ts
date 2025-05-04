import i18next from "i18next";

const Backend = require("i18next-fs-backend/cjs");

export const initMainI18n = async () => {
  const i18n = i18next.createInstance();
  await i18n.use(Backend).init({
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr"],
    ns: ["common", "notification"],
    defaultNS: "common",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    debug: false,
  });
  return i18n;
};
