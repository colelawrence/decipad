export const byDesc =
  <P extends string>(prop: P) =>
  (
    { [prop]: ida }: Record<P, unknown>,
    { [prop]: idb }: Record<P, unknown>
  ): number => {
    if (ida < idb) {
      return 1;
    }
    if (idb < ida) {
      return -1;
    }
    return 0;
  };

export const byAsc =
  <P extends string>(prop: P) =>
  (
    { [prop]: ida }: Record<P, unknown>,
    { [prop]: idb }: Record<P, unknown>
  ): number => {
    if (ida > idb) {
      return 1;
    }
    if (idb > ida) {
      return -1;
    }
    return 0;
  };
