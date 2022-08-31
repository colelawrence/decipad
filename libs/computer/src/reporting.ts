type ReporterFn = (error: Error) => void;

let captureExceptionFn: ReporterFn | undefined;

export const captureException: ReporterFn = (error) => {
  if (typeof test === 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  if (captureExceptionFn != null) {
    captureExceptionFn(error);
  }
};

/**
 * Call this with Sentry's captureException function
 *
 * The computer exposes this instead of importing Sentry, because
 * there are multiple versions of captureException for browser, node
 * and whatnot.
 */
export function setErrorReporter(reporterFn: ReporterFn) {
  captureExceptionFn = reporterFn;
}
