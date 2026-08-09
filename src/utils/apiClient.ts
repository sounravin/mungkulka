/**
 * Safe fetch helper that guarantees non-crashing JSON parsing.
 * Handles HTML error responses (e.g. 404 / 500 error page starting with "The page c...")
 * and provides clean human-readable error messages in Khmer & English.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    let data: T | null = null;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn(`JSON parse error for ${url}:`, jsonErr);
        data = null;
      }
    } else {
      // Non-JSON response (e.g. HTML 404 / 500 error page)
      const text = await res.text();
      console.warn(`Non-JSON response from ${url} (status ${res.status}):`, text.slice(0, 150));
    }

    if (!res.ok) {
      const serverErrorMessage =
        (data as any)?.error ||
        (data as any)?.message ||
        (res.status === 404
          ? 'រកមិនឃើញប្រព័ន្ធ Server (Resource not found)'
          : `Server Error (${res.status})`);
      return { ok: false, status: res.status, data, error: serverErrorMessage };
    }

    return { ok: true, status: res.status, data };
  } catch (err: any) {
    console.warn(`Network error fetching ${url}:`, err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធ Server បានទេ! (Network Connection Error)',
    };
  }
}
