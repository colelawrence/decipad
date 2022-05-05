import { useState } from 'react';
import { useReadOnly } from 'slate-react';
import { useEditorState } from '@udecode/plate';
import { ELEMENT_PLOT, PlateComponent } from '@decipad/editor-types';
import { useComputer, useResult } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { DraggableBlock } from '@decipad/editor-components';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { usePlot } from '../utils/usePlot';

const DEFAULT_TITLE = 'Plot';

export const Plot: PlateComponent = ({ attributes, element, children }) => {
  if (!element || element.type !== ELEMENT_PLOT) {
    throw new Error('PlotBlock is meant to render plot elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('PlotBlock is not a leaf');
  }
  const [error, setError] = useState<string | undefined>();
  const editor = useEditorState();
  const computer = useComputer();
  const readOnly = useReadOnly();
  const identifiedResult = useResult(element.id);
  const result = identifiedResult?.results[identifiedResult.results.length - 1];
  const { spec, data, plotParams } = usePlot({
    editor,
    computer,
    element,
    result,
  });
  const onTitleChange = useElementMutatorCallback(editor, element, 'title');

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        {children}
        <DraggableBlock element={element} blockKind="plot">
          <organisms.PlotBlock
            readOnly={readOnly}
            errorMessage={identifiedResult?.error?.message || error}
            plotParams={plotParams}
            result={
              spec &&
              data && {
                spec,
                data,
                onError: (err) => setError(err.message),
              }
            }
            title={element.title || DEFAULT_TITLE}
            onTitleChange={onTitleChange}
          />
        </DraggableBlock>
      </div>
    </div>
  );
};
