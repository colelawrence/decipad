import { css } from '@emotion/react';
import { FC } from 'react';
import { Warning } from '../../icons/Warning/Warning';
import { p16Medium } from '../../primitives';
import { CodeError } from '../CodeError/CodeError';

const errorStyles = css(
  p16Medium,

  { display: 'flex', alignItems: 'center', gap: 4 }
);

const iconWrapperStyles = css({
  display: 'inline-flex',
  //
  // strange safari bug makes errors not show
  // if this is replaced with simply height and width
  //
  '> svg': {
    height: '16px',
    width: '16px',
  },
});

interface ErrorMessageProps {
  error: string | Error;
  variant?: 'default' | 'icononly';
}

export const ErrorMessage = ({
  variant = 'default',
  error,
}: ErrorMessageProps): ReturnType<FC> =>
  variant === 'default' ? (
    <div contentEditable={false} css={errorStyles}>
      <span css={iconWrapperStyles}>
        <Warning />
      </span>{' '}
      <span>{error instanceof Error ? error.message : error}</span>
    </div>
  ) : (
    <CodeError message={error instanceof Error ? error.message : error} />
  );
