import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_PLOT,
  useMyEditorRef,
  type PlateComponent,
  type PlotElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { ConditionalResult, Invisible, PlotBlock } from '@decipad/ui';
import { useMemo } from 'react';
import { usePlot } from './utils/usePlot';
import { useTableFlip } from './utils/useTableFlip';

const Plot: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_PLOT);
  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const plot = usePlot(element);
  const path = useNodePath(element);
  const toast = useToast();
  const onTitleChange = usePathMutatorCallback<PlotElement>(
    editor,
    path,
    'title',
    'Plot'
  );

  const { flipStatus, flippedData, flippedColumnNames, flippedColumnTypes } =
    useTableFlip(element, plot.unfiltered);

  const getResult = () => {
    if (plot != null && plot.data) {
      if (element.flipTable) {
        if (flipStatus.ok) {
          return {
            data: flippedData,
            ...element,
          };
        }
        toast.warning(`Could not flip table: ${flipStatus.reason}`);
      }
      return {
        data: plot.data,
        ...element,
      };
    }
    return undefined;
  };

  const result = useMemo(getResult, [
    element,
    flipStatus.ok,
    flipStatus.reason,
    flippedData,
    plot,
    toast,
  ]);

  const columnNameOptions = useMemo(() => {
    if (element.flipTable && flipStatus.ok) {
      return flippedColumnNames;
    }
    return plot.plotParams.columnNameOptions;
  }, [
    element.flipTable,
    flipStatus,
    flippedColumnNames,
    plot.plotParams.columnNameOptions,
  ]);

  const columnTypeOptions = useMemo(() => {
    if (element.flipTable && flipStatus.ok) {
      return flippedColumnTypes;
    }
    return plot.plotParams.columnTypeOptions;
  }, [
    element.flipTable,
    flipStatus.ok,
    flippedColumnTypes,
    plot.plotParams.columnTypeOptions,
  ]);

  const chartUuid = useMemo(() => {
    return `chart-${element.id}-${new Date().toLocaleDateString('de-DE')}`;
  }, [element.id]);

  const plotParams = useMemo(() => {
    return {
      ...plot.plotParams,
      columnNameOptions,
      columnTypeOptions,
    };
  }, [columnNameOptions, columnTypeOptions, plot.plotParams]);

  return (
    <DraggableBlock
      element={element}
      blockKind="plot"
      slateAttributes={attributes}
    >
      <ConditionalResult kind={plot.plotParams.sourceType?.kind || ''}>
        {plot != null && (
          <PlotBlock
            readOnly={readOnly}
            plotParams={plotParams}
            result={result}
            title={element.title}
            onTitleChange={onTitleChange}
            chartUuid={chartUuid}
          />
        )}
      </ConditionalResult>
      {/** dont remove */}
      <Invisible>{children}</Invisible>
    </DraggableBlock>
  );
};

export default Plot;
