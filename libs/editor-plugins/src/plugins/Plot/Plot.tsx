import { ComponentProps, useState } from 'react';
import {
  ELEMENT_PLOT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { DraggableBlock } from '@decipad/editor-components';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { usePlot } from './utils/usePlot';

const DEFAULT_TITLE = 'Plot';

type PlotParamsProps = ComponentProps<typeof organisms.PlotBlock>['plotParams'];

const Plot: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_PLOT);
  const [error, setError] = useState<string | undefined>();
  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const computer = useComputer();
  const identifiedResult = useResult(element.id as string);
  const result = identifiedResult?.results[identifiedResult.results.length - 1];
  const { spec, data, plotParams } = usePlot({
    editor,
    element,
    result,
    computer,
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
            plotParams={plotParams as unknown as PlotParamsProps}
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

// Default export so we can use React.lazy
export default Plot;
