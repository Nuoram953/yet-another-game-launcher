export enum CookieType {
  SIDEBAR_COLLAPSED = 'sidebar_collapsed',
}

/**
 * Set a cookie with the given name and value
 * @param {string} name - The cookie name
 * @param {string | boolean | number} value - The cookie value
 * @param {number} days - Optional number of days until expiration
 */
export function setCookie(name: string, value: string | boolean | number, days: number = 30): void {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  
  // Convert any type to string for storage
  const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
  
  const cookieValue = encodeURIComponent(stringValue) + 
    ((days) ? `; expires=${expirationDate.toUTCString()}` : '') + 
    '; path=/';
  
  document.cookie = name + '=' + cookieValue;
}

/**
 * Get a cookie value by name
 * @param {string} name - The cookie name to retrieve
 * @param {string} type - Optional type to convert the result to ('string', 'boolean', or 'number')
 * @returns {string | boolean | number | null} The cookie value or null if not found
 */
export function getCookie(name: string, type: 'string' | 'boolean' | 'number' = 'string'): string | boolean | number | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const rawValue = decodeURIComponent(c.substring(nameEQ.length, c.length));
      
      // Convert the string value to the requested type
      if (type === 'boolean') {
        return rawValue === 'true';
      } else if (type === 'number') {
        return Number(rawValue);
      } else {
        return rawValue;
      }
    }
  }
  
  return null;
}

/**
 * Delete a cookie by setting its expiration to the past
 * @param {string} name - The cookie name to delete
 */
export function deleteCookie(name: string): void {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
