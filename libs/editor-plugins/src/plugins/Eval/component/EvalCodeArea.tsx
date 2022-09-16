import { useEffect } from 'react';
import {
  EvalElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';
import { EvalCodeArea as UIEvalCodeArea } from '@decipad/ui';

import _ from 'lodash';
import { evalUnsafeCode } from './evalUnsafeCode';

const evalUnsafeCodeDebounced = _.debounce(evalUnsafeCode, 250);

export const EvalCodeArea: PlateComponent = (props) => {
  const editor = useTEditorRef();
  const element = props.element as EvalElement;
  const unsafeCode = getNodeString(element);
  const updateResult = useElementMutatorCallback(editor, element, 'result');

  useEffect(() => {
    evalUnsafeCodeDebounced(unsafeCode)
      ?.then((expr) => updateResult(expr))
      .catch((err) => console.error(err));
  }, [updateResult, unsafeCode]);

  return (
    <div {...props.attributes}>
      <DraggableBlock blockKind="codeLine" element={element}>
        <UIEvalCodeArea>{props.children}</UIEvalCodeArea>
      </DraggableBlock>
    </div>
  );
};
