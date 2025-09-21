/**
 * Darkens a color by a specified amount
 * @param {string} color - Color in hex (#RGB, #RRGGBB), rgb(), rgba(), hsl(), or named color
 * @param {number} amount - Amount to darken (0-1, where 0 = no change, 1 = black)
 * @returns {string} - Darkened color in hex format
 */
export const darkenColor = (color, amount = 0.2) => {
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));

  // Convert color to RGB values
  const rgb = colorToRgb(color);
  if (!rgb) return color; // Return original if conversion fails

  // Darken by reducing each RGB component
  const darkenedR = Math.round(rgb.r * (1 - amount));
  const darkenedG = Math.round(rgb.g * (1 - amount));
  const darkenedB = Math.round(rgb.b * (1 - amount));

  // Convert back to hex
  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
};

/**
 * Alternative function that darkens by mixing with black
 * @param {string} color - Color in hex format
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} - Darkened color in hex format
 */
export const darkenColorMix = (color, amount = 0.2) => {
  amount = Math.max(0, Math.min(1, amount));

  const rgb = colorToRgb(color);
  if (!rgb) return color;

  // Mix with black
  const darkenedR = Math.round(rgb.r * (1 - amount) + 0 * amount);
  const darkenedG = Math.round(rgb.g * (1 - amount) + 0 * amount);
  const darkenedB = Math.round(rgb.b * (1 - amount) + 0 * amount);

  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
};

/**
 * Converts various color formats to RGB object
 * @param {string} color - Color in various formats
 * @returns {object|null} - {r, g, b} object or null if invalid
 */
const colorToRgb = (color) => {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      // #RGB -> #RRGGBB
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    } else if (hex.length === 6) {
      // #RRGGBB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return { r, g, b };
    }
  }

  // Handle rgb() and rgba()
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle named colors by creating a temporary element
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
  }

  return null;
};

// Usage examples:
// darkenColor('#ff5733', 0.2) // Makes red 20% darker
// darkenColor('rgb(255, 87, 51)', 0.3) // Makes RGB color 30% darker
// darkenColor('red', 0.1) // Makes named color 10% darker
