import { MyElement, useTEditorRef } from '@decipad/editor-types';
import {
  defaultConvertInto,
  defaultTextConversions,
} from '@decipad/editor-utils';
import { findNodePath } from '@udecode/plate';
import { useMemo } from 'react';

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useTEditorRef();

  const onTurnInto = useMemo(
    () => defaultConvertInto(editor, findNodePath(editor, element)),
    [editor, element]
  );
  const turnInto = useMemo(
    () => defaultTextConversions.filter(({ value }) => value !== element.type),
    [element]
  );

  return {
    onTurnInto,
    turnInto,
  };
};
