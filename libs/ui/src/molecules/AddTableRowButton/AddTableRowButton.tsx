import { css } from '@emotion/react';
import { FC } from 'react';
import { noop } from '@decipad/utils';
import { cssVar, setCssVar, p13Medium } from '../../primitives';
import { Create } from '../../icons';
import { table } from '../../styles';

const tdStyles = css({
  backgroundColor: cssVar('backgroundColor'),
  '&:hover, &:focus-within': {
    backgroundColor: cssVar('highlightColor'),
  },
  height: '36px',
});

const buttonStyles = css(p13Medium, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),

  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  width: '100%',
  height: '100%',
  padding: `0 ${table.cellSidePadding}`,
});

const iconWrapperStyles = css({
  ...setCssVar('strongTextColor', cssVar('weakTextColor')),

  height: '16px',
  width: '16px',
});

interface AddTableRowButtonProps {
  readonly colSpan: number;
  readonly onAddRow?: () => void;
}

export const AddTableRowButton = ({
  colSpan,
  onAddRow = noop,
}: AddTableRowButtonProps): ReturnType<FC> => {
  return (
    <tr>
      <td css={tdStyles} colSpan={colSpan}>
        <button css={buttonStyles} onClick={onAddRow}>
          <span css={iconWrapperStyles}>
            <Create />
          </span>
          <span>Add row</span>
        </button>
      </td>
    </tr>
  );
};
