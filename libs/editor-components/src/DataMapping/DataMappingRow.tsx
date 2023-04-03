import {
  DataMappingElement,
  ELEMENT_DATA_MAPPING_ROW,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-utils';
import { parseSimpleValue } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { cssVar, MenuItem, MenuList, StructuredInputUnits } from '@decipad/ui';
import { css } from '@emotion/react';
import { getParentNode, removeNodes } from '@udecode/plate';
import { Caret, Number, Trash } from 'libs/ui/src/icons';
import { useCallback, useMemo, useState } from 'react';
import { SimpleValueContext, VarResultContext } from '../CodeLine';
import { getSyntaxError } from '../CodeLine/getSyntaxError';

export const DataMappingRow: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_MAPPING_ROW);
  const [open, setOpen] = useState(false);

  const computer = useComputer();
  const editor = useTEditorRef();
  const path = useNodePath(element);
  const onChangeUnit = usePathMutatorCallback(editor, path, 'unit');

  const parent = getParentNode<DataMappingElement>(editor, path!)![0];
  const changeSourceColumn = usePathMutatorCallback(
    editor,
    path,
    'sourceColumn'
  );

  const [, lineResult] = computer.getBlockIdResult$.useWithSelector(
    (line) => [getSyntaxError(line), line] as const,
    element.id
  );

  const onDelete = useCallback(() => {
    if (path) {
      removeNodes(editor, { at: path });
    }
  }, [editor, path]);

  const columns = computer.getAllColumns$.use(parent.source);
  const selectedColumn = columns.find((c) =>
    parent.sourceType === 'notebook-table'
      ? c.blockId === element.sourceColumn
      : c.columnName === element.sourceColumn
  );

  // HACK: To display the right colour on the varname, we give it a dummy simple value.
  const dummySimpleValue = useMemo(() => parseSimpleValue('0'), []);

  return (
    <div {...attributes} css={styles}>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          marginRight: '8px',
          minWidth: '120px',
        }}
      >
        <SimpleValueContext.Provider value={dummySimpleValue}>
          <VarResultContext.Provider value={lineResult}>
            {children}
          </VarResultContext.Provider>
        </SimpleValueContext.Provider>
      </div>
      <div
        contentEditable={false}
        css={{ width: '100%', display: 'flex', alignItems: 'center', flex: 3 }}
      >
        <MenuList
          root
          dropdown
          open={open}
          onChangeOpen={setOpen}
          trigger={
            <div css={columnTriggerStyles}>
              {selectedColumn?.columnName ?? <>Select column</>}
              <div css={{ width: 16, height: 16 }}>
                <Caret variant="down" />
              </div>
            </div>
          }
        >
          {parent.source &&
            columns.map((column) => (
              <MenuItem
                icon={<Number />}
                onSelect={() => {
                  changeSourceColumn(
                    parent.sourceType === 'notebook-table'
                      ? column.blockId!
                      : column.columnName
                  );
                }}
              >
                <div css={{ minWidth: '120px' }}>{column.columnName}</div>
              </MenuItem>
            ))}
        </MenuList>
      </div>
      <div css={typeStyles} contentEditable={false}>
        <StructuredInputUnits unit={element.unit} onChangeUnit={onChangeUnit} />
      </div>
      <aside
        contentEditable={false}
        css={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '8px',
          display: 'flex',
          cursor: 'pointer',
        }}
        onClick={onDelete}
      >
        <div css={{ width: 16, height: 16 }}>
          <Trash />
        </div>
      </aside>
    </div>
  );
};

const styles = css({
  display: 'flex',
  width: '100%',
  aside: {
    visibility: 'hidden',
  },
  ':hover aside': {
    visibility: 'visible',
  },
});

const columnTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  gap: '4px',
  padding: '8px 4px 8px 4px',
  border: `1px solid ${cssVar('borderColor')}`,
});

const typeStyles = css({
  flex: 1,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  border: `1px solid ${cssVar('borderColor')}`,
});
