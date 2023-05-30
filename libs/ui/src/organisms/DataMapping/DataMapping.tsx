/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { DataMappingElement } from '@decipad/editor-types';
import { FC, ReactNode, useState } from 'react';
import { Result } from '@decipad/computer';
import { useDelayedValue } from '@decipad/react-utils';
import { MenuList, StructuredInputUnits } from '../../molecules';
import { cssVar, grey100, p12Medium, p13Bold } from '../../primitives';
import { Button, MenuItem } from '../../atoms';
import { FolderOpen, Number, Table } from '../../icons';
import { useResultInfo } from '../CodeLine/CodeLine';
import { TableButton } from '../TableButton/TableButton';

interface DataMappingProps {
  readonly sourceName: string;
  readonly sourceType: DataMappingElement['sourceType'];
  readonly result: Result.Result | undefined;
  readonly unit?: DataMappingElement['unit'];
  readonly results: Array<{
    id: string;
    name: string;
    type: NonNullable<DataMappingElement['sourceType']>;
  }>;
  readonly columnLength: number;
  readonly nameChild: ReactNode;
  readonly rowChildren: ReactNode;
  readonly onSelectSource: (
    sourceId: string,
    sourceType: NonNullable<DataMappingElement['sourceType']>
  ) => void;
  readonly onAddMapping: () => void;
  readonly onChangeUnit: (newUnit: DataMappingElement['unit']) => void;
}

export const DataMapping: FC<DataMappingProps> = ({
  sourceName,
  sourceType,
  result,
  unit,
  onChangeUnit,
  results,
  columnLength,
  nameChild,
  rowChildren,
  onSelectSource,
  onAddMapping,
}) => {
  const [open, setOpen] = useState(false);
  const [isResultHidden, setIsResultHidden] = useState(false);

  const isTable = sourceType && sourceType !== 'notebook-var';

  const freshResult = useResultInfo({
    result,
    variant: 'table',
  });

  const { inline, expanded } = useDelayedValue(
    freshResult,
    freshResult.errored === true
  );

  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
      <div css={parentStyles}>
        {nameChild}
        <div css={contentStyles}>
          <div css={topRowStyles} contentEditable={false}>
            <MenuList
              root
              dropdown
              open={open}
              onChangeOpen={setOpen}
              trigger={<div css={[p12Medium, triggerStyles]}>{sourceName}</div>}
            >
              {results.map((res) => (
                <MenuItem
                  icon={res.type === 'notebook-var' ? <Number /> : <Table />}
                  key={res.id}
                  onSelect={() => {
                    onSelectSource(res.id, res.type);
                  }}
                >
                  {res.name}
                </MenuItem>
              ))}
            </MenuList>
            {isTable && (
              <>
                <div css={{ width: 16, height: 16 }}>
                  <FolderOpen />
                </div>
                <span css={p13Bold}>{columnLength} Columns</span>
              </>
            )}
            {!isTable && (
              <div css={typeStyles} contentEditable={false}>
                <StructuredInputUnits unit={unit} onChangeUnit={onChangeUnit} />
              </div>
            )}
            <TableButton
              captions={['Hide Preview']}
              onClick={() => setIsResultHidden(!isResultHidden)}
            />
            {!isResultHidden && <div>{inline}</div>}
          </div>
          {rowChildren}
          {isTable && (
            <div contentEditable={false} css={{ marginTop: '4px' }}>
              <Button type="secondary" onClick={onAddMapping}>
                + Add Mapping
              </Button>
            </div>
          )}
        </div>
      </div>
      {!isResultHidden && <div>{expanded}</div>}
    </div>
  );
};

const triggerStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6px',
  borderRadius: '4px',
  minWidth: '80px',
  width: 'min-content',
  marginLeft: '4px',
  backgroundColor: grey100.rgb,
});

const parentStyles = css({
  display: 'flex',
  paddingTop: '4px',
  paddingBottom: '4px',
});

const topRowStyles = css({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  gap: '4px',
});

const contentStyles = css({
  display: 'flex',
  flexDirection: 'column',
});

const typeStyles = css({
  flex: 1,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  border: `1px solid ${cssVar('borderColor')}`,
});
