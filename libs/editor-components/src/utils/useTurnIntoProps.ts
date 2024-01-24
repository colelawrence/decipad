import { MyElement, useMyEditorRef } from '@decipad/editor-types';
import {
  defaultConvertInto,
  defaultTextConversions,
} from '@decipad/editor-utils';
import { useMemo } from 'react';

export const useTurnIntoProps = (element: MyElement) => {
  const editor = useMyEditorRef();

  const onTurnInto = useMemo(
    () => defaultConvertInto(editor, element),
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
