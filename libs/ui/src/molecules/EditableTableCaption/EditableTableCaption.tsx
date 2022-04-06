import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { Table as TableIcon } from '../../icons';
import { CellInput } from '../../atoms/CellInput/CellInput';
import { identifierNamePattern } from '../../utils/language';
import { blockAlignment } from '../../styles';

const tableTitleWrapper = css({
  alignItems: 'center',
  display: 'flex',
  gap: '9px',
  padding: `${blockAlignment.editorTable.paddingTop} 0 12px 0`,
});

const tableIconSizeStyles = css({
  display: 'grid',
  width: '16px',
  height: '16px',
});

type EditableTableCaptionProps = Pick<
  ComponentProps<typeof CellInput>,
  'onChange' | 'readOnly' | 'value'
>;

export const EditableTableCaption = ({
  onChange,
  readOnly,
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
          readOnly={readOnly}
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
