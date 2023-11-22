import { getNodeString } from '@udecode/plate-common';
import { Verbalizer } from './types';

export const nodeStringVerbalizer: Verbalizer = (element) =>
  getNodeString(element);
