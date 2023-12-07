export const MAX_CREDITS_EXEC_COUNT = {
  free: 50,
  pro: 500,
};

export const TOKENS_TO_CREDITS = 2_000;

// 50 credits, 2000 tokens = 1 credit.
export const OPEN_AI_TOKENS_LIMIT =
  MAX_CREDITS_EXEC_COUNT.free * TOKENS_TO_CREDITS;
export const OPEN_AI_PREMIUM_TOKENS_LIMIT =
  MAX_CREDITS_EXEC_COUNT.pro * TOKENS_TO_CREDITS;

export const OBSERVED = Symbol('observed');
