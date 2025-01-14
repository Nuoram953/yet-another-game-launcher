import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import HttpBackend from 'i18next-http-backend';

const i18nConfig = {
  fallbackLng: "en",
  supportedLngs: ["en"],
  ns: ["common", "GameStatus"],
  defaultNS: "common",
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(HttpBackend)
  .init({
    ...i18nConfig,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    debug: true,
    backend: {
      loadPath: "./locales/{{lng}}/{{ns}}.json",
    },
    missingKeyHandler: (lng, ns, key) => {
      console.log(
        `Missing translation - Language: ${lng}, Namespace: ${ns}, Key: ${key}`,
      );
    },
  });
i18n.on("initialized", (options) => {
  console.log("i18next initialized with options:", options);
});

i18n.on("loaded", (loaded) => {
  console.log("i18next resources loaded:", loaded);
});

i18n.on("failedLoading", (lng, ns, msg) => {
  console.error("i18next failed loading:", { lng, ns, msg });
});

// Log the current state
setTimeout(() => {
  console.log("Available resources:", i18n.services.resourceStore.data);
  console.log("Current language:", i18n.language);
  console.log("Available namespaces:", i18n.options.ns);
}, 1000);

export default i18n;
