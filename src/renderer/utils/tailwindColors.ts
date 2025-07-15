import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

export const extractTailwindColors = () => {
  const colors: Record<string, string> = {};

  const flatten = (obj: any, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "string") {
        colors[newKey] = value;
      } else if (typeof value === "object") {
        flatten(value, newKey);
      }
    });
  };

  flatten(fullConfig.theme.colors.design);

  Object.keys(colors).forEach((key) => {
    if (key.endsWith("-DEFAULT")) {
      const baseKey = key.replace(/-DEFAULT$/, "");
      colors[baseKey] = colors[key];
      delete colors[key];
    }
  });

  return colors;
};
