import type { SerializedColumnDescArray } from '../types/serializedTypes';
import { decodeColumnDesc } from './decodeColumnDesc';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';

export const decodeColumnDescArray = async (
  context: ClientWorkerContext,
  value: SerializedColumnDescArray
) =>
  Promise.all(value.map((columnDesc) => decodeColumnDesc(context, columnDesc)));
