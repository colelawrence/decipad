/* eslint-disable @typescript-eslint/no-explicit-any */
type Job = (...args: any[]) => any;
export type RustResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: Error };

export function caughtResult<T extends Job>(
  callback: T
): RustResult<ReturnType<T>> {
  try {
    return { ok: true, result: callback() };
  } catch (e) {
    if (!(e instanceof Error)) {
      throw new Error(
        'catchedError failed because it didnt get Error instance'
      );
    }

    return { ok: false, error: e };
  }
}
