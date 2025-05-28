import { authenticate, login } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  
  // Check if this is a login request with a shop parameter
  if (url.searchParams.has("shop")) {
    return await login(request);
  }
  
  // For callback routes without shop parameter
  await authenticate.admin(request);
  return null;
};