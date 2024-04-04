import type { TTextOperation } from '@udecode/plate-common';
import type { OpMapper } from '../types';
import insertText from './insertText';
import removeText from './removeText';

const mappers: OpMapper<TTextOperation> = {
  insert_text: insertText,
  remove_text: removeText,
};

export default mappers;
