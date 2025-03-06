// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withAbortController = <Fn extends (...args: any[]) => any>(
  fn: (abortController?: AbortController) => Fn
) => {
  let a: AbortController | undefined;

  return async (...args: Parameters<Fn>) => {
    a?.abort('Aborting previous import');
    a = new AbortController();

    fn(a)(...args);
  };
};
