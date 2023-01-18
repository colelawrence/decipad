import { currencyUnits } from '@decipad/computer';
import {
  ELEMENT_STRUCTURED_IN,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import {
  cssVar,
  MenuItem,
  MenuList,
  StructuredInputLines,
  TriggerMenuItem,
} from '@decipad/ui';
import { Caret, DollarCircle, Number } from 'libs/ui/src/icons';
import { variableNameContainerStyles } from 'libs/ui/src/organisms/CodeLineStructured/styles';
import { Children, useCallback, useState } from 'react';
import { DraggableBlock } from '../block-management';
import { BlockLengthSynchronizationReceiver } from '../BlockLengthSynchronization/BlockLengthSynchronizationReceiver';
import { VarResultContext } from '../CodeLine';
import { getSyntaxError } from '../CodeLine/getSyntaxError';

const presentableCurrencyUnits = currencyUnits.filter((f) => {
  return !!f.pretty && f.pretty.length <= 3;
});

type ExpandableColumns = 'distance' | 'currency' | null;

export const StructuredInput: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  assertElementType(element, ELEMENT_STRUCTURED_IN);

  const editor = useTEditorRef();
  const computer = useComputer();
  const changeType = useElementMutatorCallback(editor, element, 'unit');
  const childrenArray = Children.toArray(children);

  const [open, setOpen] = useState(false);
  const [currentOpen, setCurrentOpen] = useState<ExpandableColumns>(null);

  const [, lineResult] = computer.getBlockIdResult$.useWithSelector(
    (line) => [getSyntaxError(line), line] as const,
    element.id
  );

  const onColumnExpand = useCallback(
    (current: ExpandableColumns) => {
      setCurrentOpen(current === currentOpen ? null : current);
    },
    [currentOpen]
  );

  return (
    <DraggableBlock element={element} blockKind="codeLine">
      <StructuredInputLines>
        <div
          {...attributes}
          id={element.id}
          css={{
            display: 'flex',
            height: 36,
          }}
        >
          <VarResultContext.Provider value={lineResult}>
            <code css={variableNameContainerStyles}>{childrenArray[0]}</code>
          </VarResultContext.Provider>
          <div
            css={{
              borderRight: `1px solid ${cssVar('borderColor')}`,
              borderLeft: `1px solid ${cssVar('borderColor')}`,
              padding: '8px',
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
              minWidth: '100px',
            }}
          >
            <BlockLengthSynchronizationReceiver
              syncGroupName="resultColumn"
              topLevelBlockId={element.id}
            >
              {childrenArray[1]}
            </BlockLengthSynchronizationReceiver>
          </div>
          <div
            css={{
              minWidth: '64px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRight: `1px solid ${cssVar('borderColor')}`,
            }}
            contentEditable={false}
          >
            <MenuList
              root
              dropdown
              open={open}
              onChangeOpen={setOpen}
              trigger={
                <div
                  css={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    display: 'flex',
                    padding: '4px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {element.unit && element.unit.length > 0 ? (
                    element.unit
                  ) : (
                    <div
                      css={{
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Number />
                    </div>
                  )}
                  <div
                    css={{
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Caret variant="down" />
                  </div>
                </div>
              }
            >
              <MenuItem icon={<Number />} onSelect={() => changeType('')}>
                Number
              </MenuItem>
              <MenuList
                itemTrigger={
                  <TriggerMenuItem icon={<DollarCircle />}>
                    <div>Currency</div>
                  </TriggerMenuItem>
                }
                onChangeOpen={() => onColumnExpand('currency')}
                open={currentOpen === 'currency'}
              >
                {presentableCurrencyUnits.map((u, i) => (
                  <MenuItem
                    key={i}
                    icon={<span>{u.pretty ?? u.name}</span>}
                    onSelect={() => changeType(u.pretty ?? u.name)}
                  >
                    {u.baseQuantity}
                  </MenuItem>
                ))}
              </MenuList>
              <MenuList
                itemTrigger={
                  <TriggerMenuItem icon={<Number />}>Distance</TriggerMenuItem>
                }
                onChangeOpen={() => onColumnExpand('distance')}
                open={currentOpen === 'distance'}
              >
                <MenuItem onSelect={() => changeType('km')}>
                  Kilometers
                </MenuItem>
                <MenuItem onSelect={() => changeType('m')}>Meters</MenuItem>
                <MenuItem onSelect={() => changeType('cm')}>
                  Centimeters
                </MenuItem>
                <MenuItem onSelect={() => changeType('miles')}>Miles</MenuItem>
                <MenuItem onSelect={() => changeType('yards')}>Yards</MenuItem>
                <MenuItem onSelect={() => changeType('inches')}>
                  Inches
                </MenuItem>
              </MenuList>
            </MenuList>
          </div>
        </div>
      </StructuredInputLines>
    </DraggableBlock>
  );
};
