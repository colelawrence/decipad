import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

const formulasDrawerStyles = css({
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '10px',
  margin: '4px 0 16px',
  padding: '6px 0',
});

interface FormulasDrawerProps {
  readonly blockId?: string;
  readonly children?: ReactNode;
}

export const FormulasDrawer = ({
  children,
}: FormulasDrawerProps): ReturnType<FC> => {
  return (
    <div>
      <section css={css(formulasDrawerStyles)} spellCheck={false}>
        <pre>{children}</pre>
      </section>
    </div>
  );
};
