// Copied from backendtypes constant
//
export const getLimit = (isPremium: boolean) =>
  isPremium
    ? Number(import.meta.env.VITE_MAX_CREDITS_PRO)
    : Number(import.meta.env.VITE_MAX_CREDITS_FREE);

export const TOKENS_TO_CREDITS = 2_000;
