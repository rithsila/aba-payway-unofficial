/**
 * ABA wraps every reply in a status envelope, and it ships two shapes.
 *
 * Legacy (`check-transaction`, older purchase):
 *   { "status": 6, "description": "tran_id not found" }
 *
 * v3 (`check-transaction-2`, current purchase):
 *   { "status": { "code": "00", "message": "Success!", ... }, "description": "success" }
 *
 * Note the success code is the *string* `"00"` in v3 and the *number* `0` in
 * the legacy shape, while failures are plain numbers (1, 5, 6, 21) in both.
 * A bare `data.status !== 0` therefore reads every v3 success as a failure,
 * which is what made a working sandbox key look broken. Normalise both here
 * so the client only ever branches on `ok`.
 */

export interface AbaStatus {
  /** Status code as a string, e.g. "00" for success, "21" for an expired key. */
  readonly code: string;
  readonly ok: boolean;
  readonly message: string;
}

export function readAbaStatus(data: unknown): AbaStatus {
  const body = (data ?? {}) as Record<string, unknown>;
  const raw = body.status;

  let code: string;
  let message: string;

  if (raw !== null && typeof raw === "object") {
    const nested = raw as Record<string, unknown>;
    code = nested.code == null ? "" : String(nested.code);
    message = firstString(nested.message, body.description);
  } else {
    code = raw == null ? "" : String(raw);
    message = firstString(body.description, body.message);
  }

  return { code, ok: isSuccessCode(code), message: message || "Unknown error" };
}

/**
 * Success is 0, however ABA spells it: `0`, `"0"`, or v3's `"00"`. Guard the
 * empty string explicitly — `Number("")` is 0, so a missing status would
 * otherwise read as success.
 */
function isSuccessCode(code: string): boolean {
  if (code === "") return false;
  return Number(code) === 0;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value !== "") return value;
  }
  return "";
}
