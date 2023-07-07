import { LiveConnectionResult } from '@decipad/live-connect';
import { useBehaviorSubject } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { BehaviorSubject } from 'rxjs';

type LiveConnectionResult$ = BehaviorSubject<LiveConnectionResult>;

const defaultImportResult: LiveConnectionResult = {
  retry: noop,
  authenticate: noop,
  result: {
    loading: true,
  },
};

export const LiveConnectionResultContext = createContext<LiveConnectionResult$>(
  new BehaviorSubject(defaultImportResult)
);

export const useLiveConnectionResult$ = (): LiveConnectionResult$ =>
  useContext(LiveConnectionResultContext);

export const useLiveConnectionResult = (): LiveConnectionResult =>
  useBehaviorSubject(useLiveConnectionResult$());

export const LiveConnectionResultContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const resultContextValue = useMemo(
    () => new BehaviorSubject<LiveConnectionResult>(defaultImportResult),
    []
  );

  return (
    <LiveConnectionResultContext.Provider value={resultContextValue}>
      {children}
    </LiveConnectionResultContext.Provider>
  );
};
