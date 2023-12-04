export type EmbeddingsVector = number[];

export type SearchHit = {
  _id: string;
  summary?: string;
  _source: {
    summary?: string;
  };
};
