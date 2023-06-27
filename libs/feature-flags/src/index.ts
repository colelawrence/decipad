export const availableFlags = [
  'INPUT_COPY',
  'DOWNLOAD_CHART',
  'INLINE_BUBBLES',
  'CODE_LINE_NAME_SEPARATED',
  'SKETCH',
  'COPY_HREF',
  'PERSISTENT_EXAMPLE',
  'EXPR_REFS',
  'WORKSPACE_MEMBERS',
  'WORKSPACE_PREMIUM_FEATURES',
  'NO_WORKSPACE_SWITCHER',
  'ONBOARDING_ACCOUNT_SETUP',
  'SHARE_PAD_WITH_EMAIL',
  'FEATURE_FLAG_SWITCHER',
  'DATA_MAPPINGS',
  'POPULATED_NEW_NOTEBOOK',
  'ROTATED_DATA_VIEW',
  'ALTERNATE_ROTATION_DATA_VIEW',
  'INTEGRATIONS_AUTH',
  'LIVE_CONN_OPTIONS',
  'LIVE_QUERY',
  'UPLOAD_IMAGE',
  'UPLOAD_CSV',
  'SHEETS_ISLANDS',
  'JS_BLOCK',
  'CODE_INTEGRATIONS_AI_BUTTON',
  // The pop up modal that allows users to create connections and queries.
  'INTEGRATIONS_MODEL_DIALOG',
  // show computer stats when clicking Alt-Shift-s
  'COMPUTER_STATS',
  'SILLY_NAMES',
  // Allow for secrets in JS
  'SECRETS_IN_JS',
  // make codelines greyscale when they are not focused
  'MUTED_CODELINES',
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
    if (rawFlags == null || rawFlags === false) {
      return {};
    }
    if (typeof rawFlags !== 'string') {
      console.error('Unknown value type for localStorage.deciFeatureFlags');
      throw new Error('Unknown value type for localStorage.deciFeatureFlags');
    }
    return JSON.parse(rawFlags);
  } catch {
    return {};
  }
};

export const getQueryStringOverrides = (): Flags => {
  const flags: Flags = {};
  const location = 'location' in globalThis ? globalThis.location : undefined;
  const search = location?.search ?? '';
  const params = new URLSearchParams(search);

  for (const key of availableFlags) {
    if (params.has(key)) {
      flags[key] = params.get(key) === 'true';
    }
  }

  return flags;
};

// Overrides will always have the highest priority
let overrides: Flags = {
  ONBOARDING_ACCOUNT_SETUP: true,
  SHARE_PAD_WITH_EMAIL: true,
  CODE_LINE_NAME_SEPARATED: true,
  EXPR_REFS: true,
  POPULATED_NEW_NOTEBOOK: true,
  JS_BLOCK: true,
  SILLY_NAMES: false,
  UPLOAD_CSV: true,
};

// Unlike overrides flag switcher will have higher priority
const flagDefaults: Flags = {
  WORKSPACE_PREMIUM_FEATURES: false,
};

const localStorageOverrides: Flags = getLocalStorageOverrides();

const testOverrides: Flags = { CODE_LINE_NAME_SEPARATED: true };

const queryStringOverrides: Flags = getQueryStringOverrides();

const envDefaults: Record<string, boolean> = {
  test: true,
  development: true,
};

const inJest = typeof jest !== 'undefined' || process.env.NODE_ENV === 'test';
const inE2E = 'navigator' in globalThis && navigator.webdriver;

export const isFlagEnabled = (flag: Flag): boolean =>
  overrides[flag] ??
  localStorageOverrides[flag] ??
  queryStringOverrides[flag] ??
  flagDefaults[flag] ??
  (inJest || inE2E ? testOverrides[flag] : undefined) ??
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
/** Enable a feature flag */
export const enable = (flag: Flag): void => {
  overrides = { ...overrides, [flag]: true };
};
export const reset = (): void => {
  overrides = {};
};
