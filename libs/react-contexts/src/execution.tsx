import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export type TExecution<T> =
  | {
      status: 'success'; // ok
      ok: T;
    }
  | {
      status: 'error' | 'warning'; // error: block receiving should throw
      err: string | Error; // warning: error but cute, ui error (no crash)
    }
  | { status: 'log'; log: string }
  | { status: 'unset' } // initial
  | { status: 'run' } // run has been requested
  | { status: 'secret'; name: string };

export type TExecutionContext<T> = {
  onExecute: Dispatch<SetStateAction<TExecution<T>>>;
  info: TExecution<T>;
};

export const ExecutionContext = createContext<TExecutionContext<boolean>>({
  onExecute: () => ({ status: 'unset' }),
  info: { status: 'unset' },
});

export const useExecutionContext = () => useContext(ExecutionContext);
