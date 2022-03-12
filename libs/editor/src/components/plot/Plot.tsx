import { ELEMENT_PLOT } from '@decipad/editor-types';
import { Result } from '@decipad/language';
import { useResults } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { useEditorState } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { useReadOnly } from 'slate-react';
import { useComputer } from '../../contexts/Computer';
import { PlateComponent } from '../../types';
import { useElementMutatorCallback } from '../../utils/slateReact';
import { DraggableBlock } from '../block-management';
import {
  enhanceSpecFromWideData,
  resultToPlotResultData,
  specFromType,
} from './plotUtils';

export const Plot: PlateComponent = ({ attributes, element, children }) => {
  if (!element || element.type !== ELEMENT_PLOT) {
    throw new Error('PlotBlock is meant to render plot elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('PlotBlock is not a leaf');
  }
  const [error, setError] = useState<string | undefined>();
  const [sourceVarNameOptions, setSourceVarNameOptions] = useState<string[]>(
    []
  );
  const [columnNameOptions, setColumnNameOptions] = useState<string[]>([]);

  const editor = useEditorState();

  const { blockResults } = useResults();
  const computer = useComputer();

  const setSourceVarName = useElementMutatorCallback(
    editor,
    element,
    'sourceVarName'
  );
  const setMarkType = useElementMutatorCallback(editor, element, 'markType');
  const setXColumnName = useElementMutatorCallback(
    editor,
    element,
    'xColumnName'
  );
  const setYColumnName = useElementMutatorCallback(
    editor,
    element,
    'yColumnName'
  );
  const setSizeColumnName = useElementMutatorCallback(
    editor,
    element,
    'sizeColumnName'
  );
  const setColorColumnName = useElementMutatorCallback(
    editor,
    element,
    'colorColumnName'
  );

  const setThetaColumnName = useElementMutatorCallback(
    editor,
    element,
    'thetaColumnName'
  );

  useEffect(() => {
    const names = computer.getNamesDefinedBefore([element.id, 0], false);
    const tableNames = names
      .filter((name) => name.type.kind === 'table')
      .map((name) => name.name);
    if (!dequal(sourceVarNameOptions, tableNames)) {
      setSourceVarNameOptions(tableNames);
    }
  }, [
    computer,
    element.id,
    sourceVarNameOptions,
    blockResults, // important dep, as to get called every time something changes in the computer
  ]);

  const readOnly = useReadOnly();

  useEffect(() => {
    const names = computer.getNamesDefinedBefore([element.id, 0], false);
    const name = names.find(
      (varName) => varName.name === element.sourceVarName
    );
    if (!name) {
      return;
    }
    const { type } = name;
    if (type.kind !== 'table') {
      return;
    }
    const candidates = type.columnNames;
    if (!dequal(columnNameOptions, candidates)) {
      setColumnNameOptions(candidates);
    }
  }, [
    computer,
    element.id,
    element.sourceVarName,
    columnNameOptions,
    blockResults, // important dep, as to get called every time something changes in the computer
  ]);

  const identifiedResult = blockResults[element.id];
  const result = identifiedResult?.results[0];

  let spec = specFromType(result?.type, element);
  const data = resultToPlotResultData(result as Result<'table'>, element);
  spec = spec && data && enhanceSpecFromWideData(spec, data);

  const {
    sourceVarName,
    xColumnName,
    yColumnName,
    sizeColumnName,
    colorColumnName,
    thetaColumnName,
    markType,
  } = element;

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
            plotParams={{
              sourceVarNameOptions,
              columnNameOptions,
              sourceVarName,
              markType,
              xColumnName,
              yColumnName,
              sizeColumnName,
              colorColumnName,
              thetaColumnName,
              setSourceVarName,
              setMarkType,
              setXColumnName,
              setYColumnName,
              setSizeColumnName,
              setColorColumnName,
              setThetaColumnName,
            }}
            result={
              spec &&
              data && {
                spec,
                data,
                onError: (err) => setError(err.message),
              }
            }
          />
        </DraggableBlock>
      </div>
    </div>
  );
};
