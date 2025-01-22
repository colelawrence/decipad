import { ClientEventsContext } from '@decipad/client-events';
import { DraggableBlock } from '../block-management/DraggableBlock';
import {
  useNodePath,
  usePathMutatorCallback,
  useComputer,
  useEditElement,
} from '@decipad/editor-hooks';
import type {
  PlateComponent,
  UserIconKey,
  MyNode,
} from '@decipad/editor-types';
import { ELEMENT_DISPLAY, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  useEditorStylesContext,
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import type { SelectItems, AvailableSwatchColor } from '@decipad/ui';
import { DisplayWidget, VariableEditor } from '@decipad/ui';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useResults } from '../hooks';
import { SerializedType } from '@decipad/language-interfaces';

const allowedKinds: SerializedType['kind'][] = [
  'number',
  'string',
  'boolean',
  'trend',
];

const filterDisplayResults = ({ blockType }: SelectItems) =>
  blockType && allowedKinds.includes(blockType.kind);

export const Display: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_DISPLAY);
  const [openMenu, setOpenMenu] = useState(false);

  // Because we only calculate results when the dropdown is open,
  // we must have the exception for this when the component hasn't yet rendered.
  // Otherwise you get `Result: Name`, because the component doesn't actually know
  // the name of the variable/result.
  const [loaded, setLoaded] = useState(false);

  const userEvents = useContext(ClientEventsContext);
  const readOnly = useIsEditorReadOnly();
  const insideLayout = useInsideLayoutContext();
  const onEdit = useEditElement(element);

  const editor = useMyEditorRef();
  const path = useNodePath(element);

  const saveIcon = usePathMutatorCallback(editor, path, 'icon', 'Display');
  const saveColor = usePathMutatorCallback(editor, path, 'color', 'Display');

  const changeBlockId = usePathMutatorCallback(
    editor,
    path,
    'blockId' as keyof MyNode,
    'Display'
  );
  const changeVarName = usePathMutatorCallback(
    editor,
    path,
    'varName' as keyof MyNode,
    'Display'
  );

  const computer = useComputer();
  const res = computer.getBlockIdResult$.use(element.blockId);

  const allResults = useResults({
    enabled: openMenu || !loaded,
  }).filter(filterDisplayResults);

  // Performance improvement: Because results are only calculated when
  // menu is open, we no longer have access to them all the time. So we
  // need to store a bit more information about it.
  const changeResult = useCallback(
    (blockId: string) => {
      const newRes = allResults.find((i) => i.blockId === blockId);
      changeVarName(newRes?.item || '');
      changeBlockId(blockId);
      setOpenMenu(false);

      // Analytics
      userEvents({
        segmentEvent: {
          type: 'action',
          action: 'widget value updated',
          props: {
            variant: 'display',
            isReadOnly: readOnly,
          },
        },
        gaEvent: {
          category: 'widget',
          action: 'widget value updated',
          label: 'display',
        },
      });
    },
    [changeBlockId, changeVarName, allResults, readOnly, userEvents]
  );

  const onExecute = useCallback(
    (option: SelectItems) => {
      changeResult(option.blockId || '');
    },
    [changeResult]
  );

  // When the component is mounted, and the result has not yet been loaded,
  // we set the result name and value, this only happens once.
  useEffect(() => {
    if (allResults.length > 0 && !loaded) {
      changeResult(element.blockId);
      setLoaded(true);
    }
  }, [changeResult, element.blockId, allResults.length, loaded]);

  const { color: defaultColor } = useEditorStylesContext();
  const { color = defaultColor } = element;
  return (
    <DraggableBlock
      blockKind="interactive"
      element={element}
      slateAttributes={attributes}
      contentEditable={false}
    >
      <VariableEditor
        variant="display"
        color={color as AvailableSwatchColor}
        readOnly={readOnly}
        insideLayout={insideLayout}
        onClickEdit={onEdit}
      >
        <DisplayWidget
          openMenu={openMenu}
          onChangeOpen={setOpenMenu}
          onExecute={onExecute}
          allResults={allResults}
          formatting={element.formatting}
          lineResult={res}
          result={element.varName}
          readOnly={readOnly}
          color={color as AvailableSwatchColor}
          icon={element.icon as UserIconKey | undefined}
          saveIcon={saveIcon}
          saveColor={saveColor}
        >
          {children}
        </DisplayWidget>
      </VariableEditor>
    </DraggableBlock>
  );
};
