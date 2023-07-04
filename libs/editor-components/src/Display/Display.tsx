import { ClientEventsContext } from '@decipad/client-events';
import {
  DraggableBlock,
  useDragAndDropGetAxis,
  useDragAndDropOnDrop,
  useUnnamedResults,
} from '@decipad/editor-components';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  COLUMN_KINDS,
  ELEMENT_DISPLAY,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isDragAndDropHorizontal, safeDelete } from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import {
  DisplayWidget,
  VariableEditor,
  DropdownMenu,
  SelectItems,
  UserIconKey,
} from '@decipad/ui';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { noop } from '@decipad/utils';
import { Number } from 'libs/ui/src/icons';

const displayDebounceNamesDefinedMs = 500;

export const Display: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_DISPLAY) {
    throw new Error(`Expression is meant to render expression elements`);
  }
  const [openMenu, setOpenMenu] = useState(false);

  // Because we only calculate results when the dropdown is open,
  // we must have the exception for this when the component hasn't yet rendered.
  // Otherwise you get `Result: Name`, because the component doesn't actually know
  // the name of the variable/result.
  const [loaded, setLoaded] = useState(false);

  const userEvents = useContext(ClientEventsContext);
  const readOnly = useIsEditorReadOnly();

  const editor = useTEditorRef();
  const path = useNodePath(element);

  const saveIcon = usePathMutatorCallback(editor, path, 'icon', 'Display');
  const changeBlockId = usePathMutatorCallback(
    editor,
    path,
    'blockId',
    'Display'
  );
  const changeVarName = usePathMutatorCallback(
    editor,
    path,
    'varName',
    'Display'
  );

  const res = useResult(element.blockId);
  const computer = useComputer();

  const [deleted, setDeleted] = useState(false);
  const onDelete = useCallback(() => {
    if (path) {
      setDeleted(true);
      safeDelete(editor, path);
    }
  }, [editor, path]);

  // Results from computer are NOT calculated until the menu is actually open.
  // Saving a lot of CPU when the editor is re-rendering when the user is busy
  // doing other work.
  const namesDefined = computer.getNamesDefined$
    .useWithSelectorDebounced(
      displayDebounceNamesDefinedMs,
      useCallback(
        (names) =>
          Object.values(names).map((name, i): SelectItems | undefined => {
            if (!openMenu && loaded) return undefined;
            const { kind } = name.type;
            if (
              !(
                kind === 'string' ||
                kind === 'number' ||
                kind === 'boolean' ||
                kind === 'type-error'
              ) ||
              name.kind !== 'variable'
            ) {
              return undefined;
            }
            return {
              index: i,
              item: name.name,
              blockId: name.blockId || '',
              group: 'Variables',
            };
          }),
        [loaded, openMenu]
      )
    )
    .filter((n): n is SelectItems => n !== undefined)
    .map((name) => ({ ...name, icon: <Number /> }));

  // Decilang codelines do not need to have a name defining them.
  // But we still want to add them.
  const unnamedResults = useUnnamedResults();

  const allResults = useMemo(
    (): SelectItems[] => [
      ...namesDefined,
      ...unnamedResults.map((r, i) => ({
        index: i + namesDefined.length,
        item: r.sourceCode,
        blockId: r.blockId,
        group: 'Calculations',
        icon: <Number />,
      })),
    ],
    [namesDefined, unnamedResults]
  );

  const isHorizontal = isDragAndDropHorizontal(deleted, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });

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
        type: 'action',
        action: 'widget value updated',
        props: {
          variant: 'display',
          isReadOnly: readOnly,
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

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <DraggableBlock
        blockKind="interactive"
        element={element}
        accept={isHorizontal ? COLUMN_KINDS : undefined}
        getAxis={getAxis}
        onDrop={onDrop}
      >
        <VariableEditor
          variant="display"
          readOnly={readOnly}
          element={element}
          onDelete={onDelete}
        >
          <DropdownMenu
            open={openMenu}
            setOpen={!readOnly ? setOpenMenu : noop}
            onExecute={onExecute}
            groups={allResults}
            isReadOnly={readOnly}
          >
            <DisplayWidget
              openMenu={openMenu}
              onChangeOpen={setOpenMenu}
              lineResult={res}
              result={element.varName}
              readOnly={readOnly}
              icon={element.icon as UserIconKey}
              saveIcon={saveIcon}
            >
              {children}
            </DisplayWidget>
          </DropdownMenu>
        </VariableEditor>
      </DraggableBlock>
    </div>
  );
};
