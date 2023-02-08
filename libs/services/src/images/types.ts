export interface Upload {
  headers: Record<string, string | undefined>;
  body: string;
}

export interface Dimensions {
  width: number;
  height: number;
}
