import type { ErrSpec, IInferError } from '@decipad/language-interfaces';

export const encodeInferError =
  (encodeErrorSpec: (spec: ErrSpec) => ErrSpec) =>
  (error: IInferError): IInferError => {
    return {
      ...error,
      spec: encodeErrorSpec(error.spec),
    };
  };
