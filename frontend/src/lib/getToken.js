/**
 * Reads the Sanctum Bearer token from Zustand's persisted storage.
 * Use this when you need the token outside of an Axios request
 * (e.g. for a raw fetch() call to download a PDF blob).
 */
export default function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem("ekta_auth") || "{}");
    return auth?.state?.token ?? null;
  } catch {
    return null;
  }
}
