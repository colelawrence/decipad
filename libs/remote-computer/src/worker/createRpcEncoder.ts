import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';
import type {
  RPCMethodName,
  TRPCDecodedArgs,
  TRPCDecodedResult,
  TRPCEncodedArgs,
  TRPCWorkerHandler,
} from '../types/rpc';
import { createRPCWorkerArgDecoder } from '../decode/createRPCWorkerArgDecoder';
import type { Computer } from '@decipad/computer-interfaces';
import { createRpcResultEncoder } from '../encode/createRpcResultEncoder';
import type { PromiseOrType } from '@decipad/utils';

type ComputerMethod<TMethodName extends RPCMethodName> = (
  this: Computer,
  ...args: TRPCDecodedArgs<TMethodName>
) => PromiseOrType<TRPCDecodedResult<TMethodName>>;

export const createWorkerHandler =
  (ready: Promise<unknown>) =>
  <TMethodName extends RPCMethodName>(
    computer: Computer,
    store: RemoteValueStore,
    methodName: TMethodName
  ): TRPCWorkerHandler<TMethodName> => {
    const decodeArgs = createRPCWorkerArgDecoder(methodName);
    const encodeResult = createRpcResultEncoder(methodName);
    const method: ComputerMethod<TMethodName> = computer[
      methodName
    ] as ComputerMethod<TMethodName>;

    return (async (args: TRPCEncodedArgs<TMethodName>) => {
      await ready;
      const decodedArgs = await decodeArgs(store, args);
      const decodedResult = await method.apply(
        computer,
        decodedArgs as Parameters<typeof computer[typeof methodName]>
      );
      return encodeResult(decodedResult, store);
    }) as TRPCWorkerHandler<TMethodName>;
  };
