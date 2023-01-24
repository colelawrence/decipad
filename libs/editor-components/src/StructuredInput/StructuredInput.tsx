import {
  ELEMENT_STRUCTURED_IN,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { StructuredInputLines, StructuredInputUnits } from '@decipad/ui';
import { findNodePath, getPreviousNode } from '@udecode/plate';
import { variableNameContainerStyles } from 'libs/ui/src/organisms/CodeLineStructured/styles';
import { Children } from 'react';
import { DraggableBlock } from '../block-management';
import { VarResultContext } from '../CodeLine';
import { getSyntaxError } from '../CodeLine/getSyntaxError';

export const StructuredInput: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_STRUCTURED_IN);

  const editor = useTEditorRef();
  const computer = useComputer();
  const path = findNodePath(editor, element);

  const onChangeUnit = useElementMutatorCallback(editor, element, 'unit');
  const childrenArray = Children.toArray(children);

  const [, lineResult] = computer.getBlockIdResult$.useWithSelector(
    (line) => [getSyntaxError(line), line] as const,
    element.id
  );

  const prevElement = getPreviousNode<MyElement>(editor, { at: path });

  return (
    <DraggableBlock
      element={element}
      blockKind="codeLine"
      hasPreviousSibling={prevElement?.[0].type === ELEMENT_STRUCTURED_IN}
      isCentered={true}
    >
      <StructuredInputLines>
        <div
          {...attributes}
          contentEditable={true}
          id={element.id}
          css={{
            display: 'flex',
            minHeight: 36,
          }}
        >
          <VarResultContext.Provider value={lineResult}>
            <code css={variableNameContainerStyles}>{childrenArray[0]}</code>
          </VarResultContext.Provider>
          {childrenArray[1]}
          <StructuredInputUnits
            unit={element.unit ?? ''}
            onChangeUnit={onChangeUnit}
          />
        </div>
      </StructuredInputLines>
    </DraggableBlock>
  );
};
