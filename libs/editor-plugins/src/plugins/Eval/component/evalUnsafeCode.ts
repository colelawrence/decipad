import { isEnabled } from '@decipad/feature-flags';

export const evalUnsafeCode = async (unsafeCode: string): Promise<string> => {
  if (!isEnabled('UNSAFE_JS_EVAL'))
    throw new Error('eval is only available for developers');

  // We allow eval only for developers.
  // Please sandbox execution if we ever decide to ship it to the users.
  // eslint-disable-next-line no-eval
  const result = eval(unsafeCode);

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'object' && 'then' in result) {
    const promise: Promise<any> = result;

    return promise.then((res: any) => {
      if (typeof res !== 'string') {
        throw new Error('Result should be a string');
      }

      return res;
    });
  }

  throw new Error('Result should be a string');
};
