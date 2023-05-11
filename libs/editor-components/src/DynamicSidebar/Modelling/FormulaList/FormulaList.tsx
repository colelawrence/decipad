import { useComputer } from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import { formatResultPreview } from '@decipad/format';
import { css } from '@emotion/react';
import { Path } from 'slate';
import { CodeResult, cssVar, p14Medium, setCssVar } from '@decipad/ui';
import { DragHandle } from 'libs/ui/src/icons';

interface ItemInterface {
  blockId: string;
  name: string;
  type: string;
  path: Path;
}

function Variable({ blockId, onDragStart, onDragEnd }: any) {
  const computer = useComputer();
  const undebouncedResult = computer.getBlockIdResult$.use(blockId);

  const result = useDelayedValue(
    undebouncedResult,
    undebouncedResult?.result == null
  );

  if (!result?.result) {
    return null;
  }

  const asText = formatResultPreview(result.result);

  return (
    <div
      css={formula_list__result}
      draggable
      onDragStart={onDragStart({
        blockId,
        asText,
        computer,
        result: result.result,
      })}
      onDragEnd={onDragEnd}
    >
      <p>
        <CodeResult {...result.result} variant="inline" />
      </p>
      <button css={drag_btn}>
        <DragHandle />
      </button>
    </div>
  );
}

function FormulaList({ items, onDragStart, onDragEnd }: any) {
  const variables: any = items.filter(
    (item: ItemInterface) => item.type === 'var'
  );

  return (
    <div>
      <p css={titleStyles}>Formulas</p>

      <div css={formula_list__container}>
        {variables.map((variable: any, i: number) => (
          <div key={'formula-' + i}>
            <div css={formula_list__container__item}>
              <p>{variable.name ? variable.name : 'unnamed'}</p>

              <Variable
                blockId={variable.blockId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
            {i !== variables.length - 1 && <div css={divider}></div>}
          </div>
        ))}
        {variables.length === 0 && <p css={no_formulas}>No formulas found</p>}
      </div>
    </div>
  );
}

const formula_list__container = css({
  border: `solid 1px ${cssVar('strongHighlightColor')}`,
  borderRadius: '15px',
  overflow: 'hidden',
});

const formula_list__container__item = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: cssVar('backgroundColor'),
  padding: '15px',
  cursor: 'pointer',
  transition: '0.3s ease',

  ':hover': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
});

const formula_list__result = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '10px',
});

const divider = css({
  height: '1px',
  backgroundColor: cssVar('strongHighlightColor'),
});

const titleStyles = css(
  p14Medium,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  { padding: '4px 2px' }
);

const drag_btn = css({
  height: '12px',
  width: '12px',
  cursor: 'grab',
});

const no_formulas = css({
  padding: '15px',
  textAlign: 'center',
  fontSize: '14px',
});

export default FormulaList;
