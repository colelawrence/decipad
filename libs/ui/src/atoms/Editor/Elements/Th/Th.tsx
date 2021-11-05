import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { noop } from '@decipad/utils';
import { Number, Text, Placeholder } from '../../../../icons';
import { TableColumnMenu } from '../../../../organisms';

const openerWidth = 32;

const columnStyles = css({
  position: 'relative',
  fontWeight: 'normal',
  textAlign: 'left',
  backgroundColor: '#F5F7FA',
  fontSize: '14px',
  paddingRight: openerWidth,
  color: '#4D5664',
});

const headerWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '12px',
  '& > button': {
    display: 'none',
  },
  '&:hover > button, &:focus > button, & > input:focus + button, & > button:focus':
    {
      display: 'flex',
    },
});

const iconWrapperStyles = css({
  fontSize: '16px',
  height: '16px',
  width: '16px',
  display: 'block',
});

const typeIcons = {
  string: Text,
  number: Number,
  'date/time': Placeholder,
  'date/day': Placeholder,
  'date/month': Placeholder,
  'date/year': Placeholder,
};

type Type = keyof typeof typeIcons;

export type ThElementProps = ComponentProps<'th'> &
  ComponentProps<typeof TableColumnMenu> & { type: Type };

export const ThElement = ({
  children,
  type,
  onChangeColumnType = noop,
  ...props
}: ThElementProps): JSX.Element => {
  const Icon = typeIcons[type];

  return (
    <th css={columnStyles} {...props}>
      <div css={headerWrapperStyles}>
        <span css={iconWrapperStyles}>
          <Icon />
        </span>
        {children}
        <TableColumnMenu onChangeColumnType={onChangeColumnType} />
      </div>
    </th>
  );
};
