import { AiResourceTracker, getPreviousAiUsageRecord, getAiTokens } from './ai';
import { getUsageRecord, resetQueryCount } from './common';
import { StorageTracker } from './storage';

const ai = new AiResourceTracker();
const storage = new StorageTracker();

export {
  getUsageRecord,
  getPreviousAiUsageRecord,
  getAiTokens,
  ai,
  storage,
  resetQueryCount,
};
