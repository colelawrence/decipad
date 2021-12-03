import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { Table as TableIcon } from '../../icons';
import { CellInput } from '../../atoms/CellInput/CellInput';
import { identifierNamePattern } from '../../utils/language';

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
          placeholder="TableName"
          transform={(newValue) =>
            newValue.match(identifierNamePattern)?.join('') ?? ''
          }
          variant="heading"
          value={value}
        />
      </div>
    </caption>
  );
};
