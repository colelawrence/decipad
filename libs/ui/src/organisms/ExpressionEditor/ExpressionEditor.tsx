import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, ComponentProps } from 'react';
import { CodeError } from '../../atoms';

const baseWrapperStyles = css({
  width: '100%',
  display: 'grid',
  overflow: 'hidden',
});

const errorContainerStyles = css({
  alignSelf: 'center',
  justifySelf: 'center',
});

interface ExpressionEditorProps {
  error?: ComponentProps<typeof CodeError>;
  focus?: boolean;
  onFocus?: () => void;
  children?: ReactNode;
}

export const ExpressionEditor = ({
  error,
  onFocus = noop,
  children,
}: ExpressionEditorProps): ReturnType<FC> => {
  return (
    <div
      onFocus={onFocus}
      css={[
        baseWrapperStyles,
        { gridTemplateColumns: error ? '1fr 24px' : '1fr' },
      ]}
    >
      {children}
      {error && (
        <div css={errorContainerStyles}>
          <CodeError {...error} />
        </div>
      )}
    </div>
  );
};
