import { LogEntry } from '@decipad/graphql-client';

export const chunkify = (
  entries: Array<LogEntry>,
  maxSize: number
): Array<Array<LogEntry>> => {
  let currentChunk: Array<LogEntry> = [];
  const chunks: Array<Array<LogEntry>> = [currentChunk];
  let currentChunkSize = 0;
  for (const entry of entries) {
    const size = entry.content.length;
    if (size + currentChunkSize > maxSize && currentChunk.length > 0) {
      currentChunk = [];
      chunks.push(currentChunk);
      currentChunkSize = 0;
    }
    currentChunkSize += size;
    currentChunk.push(entry);
  }

  return chunks.filter((chunk) => chunk.length > 0);
};
