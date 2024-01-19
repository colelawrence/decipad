import { ws } from '@architect/functions';

type ErrorWithCode = Error & {
  code: string;
};

const errorIs = (err: unknown, errMessage: string): boolean =>
  err instanceof Error &&
  ((err as ErrorWithCode)?.code?.includes(errMessage) ||
    (err as Error).message.includes(errMessage) ||
    err.name.includes(errMessage));

const nonSeriousErrors = ['Gone', 'LimitExceeded', 'InvalidSignature'];
const isSeriousError = (err: Error) =>
  !nonSeriousErrors.some((errMessage) => errorIs(err, errMessage));

const onSendError = async (err: unknown) => {
  if (err instanceof Error && isSeriousError(err)) {
    throw err;
  }
};
export const tryWSSend = (connId: string, payload: unknown): Promise<void> => {
  return ws.send({ id: connId, payload }).catch(onSendError);
};
