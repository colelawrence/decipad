/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Add } from '../../../icons';
import { cssVar, p13Medium } from '../../../primitives';
import {
  smartRowHorizontalPadding,
  tdHorizontalPadding,
} from 'libs/ui/src/styles/table';

const buttonStyles = css(p13Medium, {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  width: 'auto',
  padding: `6px ${tdHorizontalPadding}px`,
  marginTop: `${smartRowHorizontalPadding}px`,
  borderRadius: '6px',

  backgroundColor: cssVar('backgroundDefault'),
});

const heightStyles = css({
  height: '36px',
});

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
});

export type AddTableRowButtonProps = {
  onAddRow: () => void;
};

export const AddTableRowButton = ({
  onAddRow,
}: AddTableRowButtonProps): ReturnType<FC> => {
  return (
    <>
      <th></th>
      <th key="firstcol" css={heightStyles}>
        <button
          css={buttonStyles}
          onClick={onAddRow}
          data-testid="editor-table-add-row"
        >
          <span css={iconWrapperStyles}>
            <Add />
          </span>
          <span>Add row</span>
        </button>
      </th>
    </>
  );
};
