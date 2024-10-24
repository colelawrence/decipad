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
