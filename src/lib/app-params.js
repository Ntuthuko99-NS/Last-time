// Check if the app is running on the server (Node) or in the browser
const isServer = typeof window === "undefined";

// Use a fallback storage if we're on the server
const storage = isServer
  ? new Map()
  : window.localStorage;

// Helper: convert camelCase → snake_case
const toSnakeCase = (text) => {
  return text.replace(/([A-Z])/g, "_$1").toLowerCase();
};

// Get a parameter from the URL or local storage
const getParam = (name, options = {}) => {
  const { defaultValue = null, removeFromUrl = false } = options;

  // If running on server, just return default
  if (isServer) return defaultValue;

  const key = `app_${toSnakeCase(name)}`;

  const urlParams = new URLSearchParams(window.location.search);
  const valueFromUrl = urlParams.get(name);

  // Optionally remove param from URL
  if (removeFromUrl && valueFromUrl) {
    urlParams.delete(name);

    const newUrl =
      window.location.pathname +
      (urlParams.toString() ? `?${urlParams.toString()}` : "") +
      window.location.hash;

    window.history.replaceState({}, document.title, newUrl);
  }

  // If found in URL → store it
  if (valueFromUrl) {
    storage.setItem?.(key, valueFromUrl);
    return valueFromUrl;
  }

  // If default exists → store and return it
  if (defaultValue !== null) {
    storage.setItem?.(key, defaultValue);
    return defaultValue;
  }

  // Otherwise check storage
  const storedValue = storage.getItem?.(key);
  return storedValue || null;
};

// Get all app configuration values
const getAppConfig = () => {
  // Optional: clear token if requested
  if (getParam("clear_token") === "true") {
    storage.removeItem?.("app_token");
  }

  return {
    appId: getParam("app_id", {
      defaultValue: import.meta.env.VITE_APP_ID
    }),

    token: getParam("token", {
      removeFromUrl: true
    }),

    currentUrl: getParam("current_url", {
      defaultValue: window.location.href
    }),

    apiVersion: getParam("api_version", {
      defaultValue: import.meta.env.VITE_API_VERSION
    }),

    apiBaseUrl: getParam("api_base_url", {
      defaultValue: import.meta.env.VITE_API_BASE_URL
    })
  };
};

// Export config
export const appConfig = {
  ...getAppConfig()
};
