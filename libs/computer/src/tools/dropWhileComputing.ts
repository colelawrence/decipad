import { Observable, OperatorFunction } from 'rxjs';

/**
 * rxjs operator that calls a slow function with its inputs,
 * and ignores further inputs while the function is working.
 *
 * Except for the latest input that was ignored, which gets
 * computed after the function is done.
 *
 * Essentially it works as a queue of 1
 */
export const dropWhileComputing =
  <TIn, TOut>(fn: (inp: TIn) => Promise<TOut>): OperatorFunction<TIn, TOut> =>
  (inputs: Observable<TIn>): Observable<TOut> => {
    let latestDroppedCompute: TIn | undefined;
    let computing = false;

    return new Observable((outputSub) => {
      const inputSub = inputs.subscribe({
        next: function computeInput(inp) {
          if (inputSub.closed) return;

          if (!computing) {
            computing = true;
            const doneComputing = () => {
              computing = false;

              if (latestDroppedCompute != null) {
                const newInp = latestDroppedCompute;
                latestDroppedCompute = undefined;
                computeInput(newInp);
              }
            };

            fn(inp).then(
              (fnResult) => {
                if (inputSub.closed) return;

                outputSub.next(fnResult);
                doneComputing();
              },
              (err) => {
                if (inputSub.closed) return;

                outputSub.error(err);
                doneComputing();
              }
            );
          } else {
            latestDroppedCompute = inp;
          }
        },
        complete: () => outputSub.complete(),
        error: (x) => outputSub.error(x),
      });

      return () => {
        inputSub.unsubscribe();
      };
    });
  };
