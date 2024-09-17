import { TEditor } from '@udecode/plate-common';
import { BaseRange, BaseSelection } from 'slate';

export type PlateEditorWithLastRealSelection<E extends TEditor> = E & {
  lastRealSelection: BaseRange | undefined;
};

type InsertOrWrapFunctionOpts = Partial<{
  at?: BaseSelection;
}>;

export type PlateEditorWithSelectionHelpers<E extends TEditor> =
  PlateEditorWithLastRealSelection<E> & {
    insertOrWrapFunction: (
      functionName: string,
      opts?: InsertOrWrapFunctionOpts
    ) => void;
  };
