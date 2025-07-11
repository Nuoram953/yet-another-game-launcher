import React, { createContext, useContext, useState, useEffect } from "react";
import { extractTailwindColors } from "../utils/tailwindColors";
import _ from "lodash";

const ColorContext = createContext(undefined);

export const useColors = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorProvider");
  }
  return context;
};

export const ColorProvider = ({ children }) => {
  const [defaultColors, setDefaultColors] = useState({});
  const [userColors, setUserColors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const tailwindColors = extractTailwindColors();
        setDefaultColors(tailwindColors);

        const saved = localStorage.getItem("userColors");
        if (saved) {
          setUserColors(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load colors:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadColors();
  }, []);

  useEffect(() => {
    if (isLoading || Object.keys(defaultColors).length === 0) return;

    const root = document.documentElement;

    Object.keys(defaultColors).forEach((colorName) => {
      const currentColor: string = getCurrentColor(colorName);
      root.style.setProperty(`--design-${colorName}`, currentColor);
    });
  }, [userColors, defaultColors, isLoading]);

  const updateColor = (colorName: string, value: string) => {
    const newColors = { ...userColors, [colorName]: value };
    setUserColors(newColors);
    localStorage.setItem("userColors", JSON.stringify(newColors));
  };

  const resetColor = (colorName: string) => {
    const newColors = { ...userColors };
    delete newColors[colorName];
    setUserColors(newColors);
    localStorage.setItem("userColors", JSON.stringify(newColors));
  };

  const resetAllColors = () => {
    setUserColors({});
    localStorage.removeItem("userColors");
  };

  const getCurrentColor = (colorName: string): string | null => {
    const raw = userColors[colorName] || defaultColors[colorName];
    if (_.isObject(raw)) return null;

    if (raw?.startsWith("var(")) {
      return getCSSVariableFromStylesheet(`--design-${colorName}`);
    }

    return raw;
  };

  const getCSSVariableFromStylesheet = (variableName: string, selector: string = ":root"): string | null => {
    for (const sheet of Array.from(document.styleSheets)) {
      if (!(sheet instanceof CSSStyleSheet)) continue;
      try {
        const rules = sheet.cssRules;
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
            const value = rule.style.getPropertyValue(variableName);
            if (value) return value.trim();
          }
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  };

  const value = {
    defaultColors,
    userColors,
    updateColor,
    resetColor,
    resetAllColors,
    getCurrentColor,
    isLoading,
  };

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
};
