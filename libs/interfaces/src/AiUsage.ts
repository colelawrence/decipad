export interface AiUsage {
  promptTokensUsed: number;
  completionTokensUsed: number;
  tokensQuotaLimit?: number;
}
