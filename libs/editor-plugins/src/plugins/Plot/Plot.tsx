import { ComponentProps } from 'react';
import {
  ELEMENT_PLOT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { PlotBlock } from '@decipad/ui';
import { DraggableBlock } from '@decipad/editor-components';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { usePlot } from './utils/usePlot';

const DEFAULT_TITLE = 'Plot';

type PlotParamsProps = ComponentProps<typeof PlotBlock>['plotParams'];

const Plot: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_PLOT);
  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const { spec, data, plotParams } = usePlot(element);
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
          <PlotBlock
            readOnly={readOnly}
            plotParams={plotParams as unknown as PlotParamsProps}
            result={
              spec &&
              data && {
                spec,
                data,
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
