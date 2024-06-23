import type { SubjectEncoder } from '../types/types';
import { encodeColumnDesc } from './encodeColumnDesc';

export const encodeColumnDescArray: SubjectEncoder<'getAllColumns$'> = async (
  columnDescs,
  store
) =>
  Promise.all(
    columnDescs.map((columnDesc) => encodeColumnDesc(columnDesc, store))
  );
