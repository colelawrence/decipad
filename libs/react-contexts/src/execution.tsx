import { createContext, useContext } from 'react';

export type TExecution =
  | {
      status: 'success'; // ok
      ok: boolean;
    }
  | {
      status: 'error' | 'warning'; // error: block receiving should throw
      err: string | Error; // warning: error but cute, ui error (no crash)
    }
  | { status: 'log'; log: string }
  | { status: 'unset' } // initial
  | { status: 'run' }; // run has been requested

export type TExecutionContext = {
  onExecute: (_: Array<TExecution>) => void;
  info: Array<TExecution>;
};

export const ExecutionContext = createContext<TExecutionContext>({
  onExecute: () => {},
  info: [{ status: 'run' }],
});

export const useExecutionContext = () => useContext(ExecutionContext);
