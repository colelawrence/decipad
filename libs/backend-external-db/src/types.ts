export interface DatabaseClient {
  raw: (query: string) => Promise<unknown>;
  destroy: () => void | Promise<void>;
}

export interface DatabaseClientConfig {
  connection?: {
    password?: string;
    credentials?: unknown;
    [key: string]: unknown;
  };
}
