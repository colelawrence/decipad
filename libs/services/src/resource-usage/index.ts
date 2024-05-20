import { AiResourceTracker, getPreviousAiUsageRecord, getAiTokens } from './ai';
import { getUsageRecord } from './common';
import { QueriesResourceTracker } from './queries';
import { StorageTracker } from './storage';
import type { ResourceTracker } from './types';

const ai = new AiResourceTracker();
const storage = new StorageTracker();
const queries = new QueriesResourceTracker();

export {
  getUsageRecord,
  getPreviousAiUsageRecord,
  getAiTokens,
  ai,
  storage,
  queries,
  type ResourceTracker,
};
