/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, gridShiftScreenQuery } from '../../../primitives';

const formulasDrawerStyles = css({
  gridColumn: '3 / span 1',

  [gridShiftScreenQuery]: {
    gridColumn: '2 / span 1',
  },

  border: `1px solid ${cssVar('borderDefault')}`,
  borderRadius: '8px',
  margin: '8px 0',
  pre: {
    'div:first-of-type': {
      borderRadius: '9px 9px 0 0',
    },
    'div:last-of-type': {
      borderRadius: '0 0 9px 9px',
    },
  },
});

interface FormulasDrawerProps {
  readonly blockId?: string;
  readonly children?: ReactNode;
  readonly readOnly?: boolean;
}

export const FormulasDrawer = ({
  children,
  readOnly = false,
}: FormulasDrawerProps): ReturnType<FC> => {
  return (
    <section css={formulasDrawerStyles} spellCheck={false}>
      <pre contentEditable={!readOnly}>{children}</pre>
    </section>
  );
};
