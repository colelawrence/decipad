export default (prop: string) =>
  ({ [prop]: ida }: Record<string, any>, { [prop]: idb }: Record<string, any>) => {
    if (ida < idb) {
      return 1;
    } else if (idb < ida) {
      return -1;
    }
    return 0;
  };
