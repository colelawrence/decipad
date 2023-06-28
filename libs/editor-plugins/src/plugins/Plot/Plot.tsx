import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_PLOT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { PlotBlock } from '@decipad/ui/src/organisms/PlotBlock/PlotBlock';
import { ComponentProps, useMemo } from 'react';
import { usePlot } from './utils/usePlot';

type PlotBlockProps = ComponentProps<typeof PlotBlock>;
type PlotParamsProps = PlotBlockProps['plotParams'];

const Plot: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_PLOT);
  const editor = useTEditorRef();
  const readOnly = useIsEditorReadOnly();
  const plot = usePlot(element);
  const path = useNodePath(element);
  const onTitleChange = usePathMutatorCallback(editor, path, 'title', 'Plot');
  const result = useMemo(
    () =>
      (plot != null &&
        plot.spec &&
        plot.data &&
        ({
          spec: plot.spec,
          data: plot.data,
          repeatedColumns: plot.repeatedColumns,
        } as PlotBlockProps['result'])) ||
      undefined,
    [plot]
  );

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696

  return (
    <DraggableBlock
      element={element}
      blockKind="plot"
      contentEditable={false}
      {...attributes}
    >
      {plot != null && (
        <PlotBlock
          readOnly={readOnly}
          plotParams={plot.plotParams as unknown as PlotParamsProps}
          result={result}
          title={element.title}
          onTitleChange={onTitleChange}
        />
      )}
      {children}
    </DraggableBlock>
  );
};

// Default export so we can use React.lazy
export default Plot;
