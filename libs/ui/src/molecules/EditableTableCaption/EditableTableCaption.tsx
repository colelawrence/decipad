import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { Table as TableIcon } from '../../icons';
import { CellInput } from '../../atoms/CellInput/CellInput';

const tableTitleWrapper = css({
  alignItems: 'center',
  display: 'flex',
  gap: '9px',
  padding: '12px 0',
});

const tableIconSizeStyles = css({
  width: '16px',
  height: '16px',
});

const alwaysValid = () => true;

type EditableTableCaptionProps = Omit<
  ComponentProps<typeof CellInput>,
  'className' | 'validate' | 'placeholder'
>;

export const EditableTableCaption = ({
  onChange,
  value,
}: EditableTableCaptionProps): ReturnType<FC> => {
  return (
    <caption>
      <div css={tableTitleWrapper}>
        <div css={tableIconSizeStyles}>
          <TableIcon />
        </div>
        <CellInput
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === ' ') {
              // Table names cannot contain spaces.
              e.preventDefault();
            }
          }}
          placeholder="TableName"
          variant="heading"
          value={value}
          validate={alwaysValid}
        />
      </div>
    </caption>
  );
};
