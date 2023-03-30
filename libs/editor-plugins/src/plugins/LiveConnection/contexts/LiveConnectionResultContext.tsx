import { ImportResult } from '@decipad/import';
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { BehaviorSubject } from 'rxjs';

type LiveConnectionResult$ = BehaviorSubject<ImportResult> | undefined;

export const LiveConnectionResultContext = createContext<
  LiveConnectionResult$ | undefined
>(undefined);

export const useLiveConnectionResult = (): LiveConnectionResult$ | undefined =>
  useContext(LiveConnectionResultContext);

export const LiveConnectionResultContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const resultContextValue = useMemo(
    () => new BehaviorSubject<ImportResult>({}),
    []
  );

  return (
    <LiveConnectionResultContext.Provider value={resultContextValue}>
      {children}
    </LiveConnectionResultContext.Provider>
  );
};
