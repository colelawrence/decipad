const by =
  (prop: string) =>
  ({ [prop]: ida }: any, { [prop]: idb }: any): number => {
    if (ida < idb) {
      return 1;
    } else if (idb < ida) {
      return -1;
    }
    return 0;
  };

export default by;
