export interface FetchResult {
  contentType: string | null;
  result: AsyncIterable<Uint8Array>;
}
export type FetchFunction = (url: string) => Promise<FetchResult>;
