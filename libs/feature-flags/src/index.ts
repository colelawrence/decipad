export type Flag =
  | 'INPUT_COPY'
  | 'INLINE_BUBBLES'
  | 'SHADOW_CODE_LINES'
  | 'CODE_LINE_NAME_SEPARATED'
  | 'UNSAFE_JS_EVAL'
  | 'SKETCH'
  | 'COPY_HREF'
  | 'PERSISTENT_EXAMPLE'
  | 'DATA_VIEW'
  | 'EXPR_REFS'
  | 'ONBOARDING_CHECKLIST'
  | 'COLOR_SIDEBAR'
  | 'DASHBOARD_STATUS'
  | 'DASHBOARD_SEARCH'
  | 'DROPDOWN_TABLES'
  | 'FEATURE_REQUEST'
  | 'ONBOARDING_ACCOUNT_SETUP';

export type Flags = Partial<Record<Flag, boolean>>;

const queryStringFlags: Flag[] = ['CODE_LINE_NAME_SEPARATED'];

export const getQueryStringOverrides = (): Flags => {
  const flags: Flags = {};
  const search = 'location' in globalThis ? globalThis.location.search : '';
  const params = new URLSearchParams(search);

  for (const key of queryStringFlags) {
    flags[key] = params.get(key) === 'true';
  }

  return flags;
};

let overrides: Flags = {};

const queryStringOverrides: Flags = getQueryStringOverrides();

const envDefaults: Record<string, boolean> = {
  test: true,
  development: true,
};

export const isFlagEnabled = (flag: Flag): boolean =>
  overrides[flag] ??
  queryStringOverrides[flag] ??
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
