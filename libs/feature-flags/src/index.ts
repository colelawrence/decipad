export type Flag =
  | 'INPUT_COPY'
  | 'INLINE_BUBBLES'
  | 'POTENTIAL_FORMULA_DETECTION'
  | 'EXPR_REFS'
  | 'UNSAFE_JS_EVAL'
  | 'COPY_HREF'
  | 'PERSISTENT_EXAMPLE'
  | 'DATA_VIEW'
  | 'ONBOARDING_CHECKLIST'
  | 'FEATURE_REQUEST';

export type Flags = Partial<Record<Flag, boolean>>;
let overrides: Flags = {};

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
