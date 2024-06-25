export type WithEncoded<TDecoded, TEncoded> = TDecoded & {
  __encoded?: TEncoded;
};
