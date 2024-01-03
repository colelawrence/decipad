/** Place a new item in the head of an array */
export const chooseFirst = <T>(indexOnTop: number, items: T[]): T[] => [
  items[indexOnTop],
  ...items.filter((_, i) => i !== indexOnTop),
];

/** undo a chooseFirst() */
export const undoChooseFirst = <T>(indexOnTop: number, items: T[]) =>
  items.flatMap((item, index) => {
    if (index === 0) {
      return indexOnTop === 0 ? [item] : [];
    }
    if (index === indexOnTop) {
      return [item, items[0]];
    }
    return [item];
  });
