export const availableFlags = [
  'INPUT_COPY',
  'INLINE_BUBBLES',
  'SHADOW_CODE_LINES',
  'CODE_LINE_NAME_SEPARATED',
  'UNSAFE_JS_EVAL',
  'SKETCH',
  'COPY_HREF',
  'PERSISTENT_EXAMPLE',
  'EXPR_REFS',
  'ONBOARDING_CHECKLIST',
  'COLOR_SIDEBAR',
  'DASHBOARD_STATUS',
  'DASHBOARD_SEARCH',
  'DROPDOWN_TABLES',
  'FEATURE_REQUEST',
  'ONBOARDING_ACCOUNT_SETUP',
  'FEATURE_FLAG_SWITCHER',
] as const;

export type Flag = typeof availableFlags[number];

export type Flags = Partial<Record<Flag, boolean>>;

export const FEATURE_FLAGS_KEY = 'deciFeatureFlags';

const getItem =
  'localStorage' in global
    ? global.localStorage.getItem.bind(global.localStorage)
    : (_key: string) => false;

export const getLocalStorageOverrides = (): Flags => {
  try {
    const rawFlags = getItem(FEATURE_FLAGS_KEY);
    if (typeof rawFlags !== 'string') {
      console.error('Unknown value type for localStorage.deciFeatureFlags');
      throw new Error('Unknown value type for localStorage.deciFeatureFlags');
    }
    return JSON.parse(rawFlags);
  } catch {
    return {};
  }
};

const queryStringFlags: Flag[] = ['CODE_LINE_NAME_SEPARATED'];

export const getQueryStringOverrides = (): Flags => {
  const flags: Flags = {};
  const location = 'location' in globalThis ? globalThis.location : undefined;
  const search = location?.search ?? '';
  const params = new URLSearchParams(search);

  for (const key of queryStringFlags) {
    flags[key] = params.get(key) === 'true';
  }

  return flags;
};

let overrides: Flags = {};

const localStorageOverrides: Flags = getLocalStorageOverrides();

const queryStringOverrides: Flags = getQueryStringOverrides();

const envDefaults: Record<string, boolean> = {
  test: true,
  development: true,
};

const inE2E = 'navigator' in globalThis && navigator.webdriver;

export const isFlagEnabled = (flag: Flag): boolean =>
  overrides[flag] ??
  localStorageOverrides[flag] ??
  queryStringOverrides[flag] ??
  envDefaults[process.env.NODE_ENV ?? 'production'] ??
  (!inE2E &&
    'location' in globalThis &&
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
