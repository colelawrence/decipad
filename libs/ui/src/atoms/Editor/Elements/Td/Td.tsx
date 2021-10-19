import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';

const tdStyles = css({
  border: '1px solid #ECF0F6',
  borderCollapse: 'collapse',
  fontSize: '14px',
});

export const TdElement: FC<ComponentProps<'td'>> = (props) => {
  return <td css={tdStyles} {...props} />;
};
