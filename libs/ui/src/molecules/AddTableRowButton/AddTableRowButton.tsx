/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Create } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';
import { table } from '../../styles';

const buttonStyles = css(p13Medium, {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  width: 'auto',
  padding: `6px ${table.tdHorizontalPadding}px`,
  marginTop: `${table.smartRowHorizontalPadding}px`,
  borderRadius: '6px',

  backgroundColor: cssVar('backgroundDefault'),
});

const hiddenStyles = css({
  visibility: 'hidden',
});

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
});

interface AddTableRowButtonProps {
  readonly onAddRow?: () => void;
  readonly mouseOver?: boolean;
}

export const AddTableRowButton = ({
  onAddRow = noop,
  mouseOver = false,
}: AddTableRowButtonProps): ReturnType<FC> => {
  return (
    <>
      <th></th>
      <th key="firstcol" css={css({ height: '36px' })}>
        <button
          css={[buttonStyles, !mouseOver && hiddenStyles]}
          onClick={onAddRow}
        >
          <span css={iconWrapperStyles}>
            <Create />
          </span>
          <span>Add row</span>
        </button>
      </th>
    </>
  );
};
