import type { IInferError, Type } from '@decipad/language-interfaces';
import { decodeErrorSpec } from './decodeErrorSpec';

export const decodeInferError =
  (decodeType: (type: Type) => Type) =>
  (error: IInferError): IInferError => {
    return {
      ...error,
      spec: decodeErrorSpec(decodeType)(error.spec),
    };
  };
