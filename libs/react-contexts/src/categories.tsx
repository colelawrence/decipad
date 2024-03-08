import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type CategoryValues = Array<{ id: string; value: string }>;
type CategoriesContextValue = {
  store: Map<string, CategoryValues>;
  set: (blockId: string, values: CategoryValues) => void;
};

export const CategoriesContext = createContext<CategoriesContextValue>({
  store: new Map(),
  set: () => {
    throw new Error('no context');
  },
});
export const CategoriesContextProvider: FC<
  PropsWithChildren<{
    children?: ReactNode;
  }>
> = ({ children }) => {
  const [store, setStore] = useState(new Map());
  const set = useCallback(
    (blockId: string, values: CategoryValues) => {
      const newStore = new Map(store);
      newStore.set(blockId, values);
      setStore(newStore);
    },
    [store]
  );
  return (
    <CategoriesContext.Provider
      value={useMemo(() => ({ store, set }), [set, store])}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (blockId?: string): CategoryValues => {
  const ctx = useContext(CategoriesContext);
  if (!blockId) return [];
  return ctx.store.get(blockId) ?? [];
};

export const useCategoriesNames = (): Array<string> => {
  const ctx = useContext(CategoriesContext);

  return useMemo(() => Array.from(ctx.store.keys()), [ctx.store]);
};
