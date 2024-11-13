export type BaseNode = {
  rowspan?: number;
  colspan?: number;
  depth?: number;
};

export type Element<TElement> = BaseNode &
  TElement & {
    children: Array<Element<TElement>>;
    tempChildren?: Array<Element<TElement>>;
  };
