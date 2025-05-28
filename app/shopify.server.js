// For Custom Apps - no OAuth needed, just direct API calls
export const SHOPIFY_CONFIG = {
  shop: process.env.SHOPIFY_SHOP_DOMAIN || 'home-in-style-loutraki.myshopify.com',
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

// Simple auth function for Custom Apps
export const authenticate = {
  admin: async (request) => {
    return {
      admin: {
        accessToken: SHOPIFY_CONFIG.adminAccessToken,
        shop: SHOPIFY_CONFIG.shop
      }
    };
  }
};

export const login = () => {
  // Custom apps don't need login flow
  return new Response('Custom app - no login needed', { status: 200 });
};

// Add the missing function
export const addDocumentResponseHeaders = (document, responseHeaders) => {
  // For custom apps, we don't need special headers
  return document;
};

// Add other exports that might be needed
export const apiVersion = "2025-04";
export const unauthenticated = {
  admin: () => ({ admin: null })
};
export const registerWebhooks = () => {};
export const sessionStorage = null;