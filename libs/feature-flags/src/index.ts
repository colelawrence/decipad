export type Flag =
  | 'INPUT_COPY'
  | 'INLINE_BUBBLES'
  | 'EXPR_REFS'
  | 'UNSAFE_JS_EVAL'
  | 'COPY_HREF'
  | 'PERSISTENT_EXAMPLE'
  | 'DATA_VIEW'
  | 'RESULT_WIDGET';

export type Flags = Partial<Record<Flag, boolean>>;
let overrides: Flags = {
  // flags already live in prod are set to true here
  // can also be used to manually disable a flag in development by setting to false
};

const envDefaults: Record<string, boolean> = {
  test: true,
  development: true,
};

export const isFlagEnabled = (flag: Flag): boolean =>
  overrides[flag] ??
  envDefaults[process.env.NODE_ENV ?? 'production'] ??
  ('location' in globalThis &&
    /localhost|.*dev.decipad.com/.test(globalThis.location.hostname));

export const getOverrides = (): Flags => overrides;

/**
 * Disable a flag, often for regression testing the old behavior.
 */
export const disable = (flag: Flag): void => {
  overrides = { ...overrides, [flag]: false };
};
export const reset = (): void => {
  overrides = {};
};
