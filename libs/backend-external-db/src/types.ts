import { z } from 'zod';

// A partial resposne format
export const knexRawResponseParser = z.object({
  rows: z.array(z.record(z.string(), z.any())),
  fields: z.array(
    z.object({
      name: z.string().optional(),
      type: z.string().optional(),
    })
  ),
});

export type KnexRawResponse = z.infer<typeof knexRawResponseParser>;

export interface DatabaseClient {
  raw: (query: string) => Promise<KnexRawResponse>;
  destroy: () => void | Promise<void>;
}

export interface DatabaseClientConfig {
  connection?: {
    password?: string;
    credentials?: unknown;
    [key: string]: unknown;
  };
}
