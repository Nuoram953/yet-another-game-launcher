import i18next from "i18next";
import HttpBackend from "i18next-http-backend/cjs";

const i18nConfig = {
  fallbackLng: "en",
  supportedLngs: ["en", "es", "fr"],
  ns: ["common", "main", "renderer"],
  defaultNS: "common",
};

export const initMainI18n = async () => {
  const i18n = i18next.createInstance();
  await i18n.use(HttpBackend).init({
    ...i18nConfig,
    backend: {
      loadPath: "../../locales/{{lng}}/{{ns}}.json",
    },
  });
  return i18n;
};
