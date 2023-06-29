/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

const formulasDrawerStyles = css({
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '10px',
  margin: '4px 0 16px',
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
    <div>
      <section css={css(formulasDrawerStyles)} spellCheck={false}>
        <pre contentEditable={!readOnly}>{children}</pre>
      </section>
    </div>
  );
};
