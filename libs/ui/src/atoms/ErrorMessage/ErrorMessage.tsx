import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p16Medium, setCssVar, red100, red500 } from '../../primitives';
import { Warning } from '../../icons/Warning/Warning';
import { CodeError } from '../CodeError/CodeError';

const errorStyles = css(
  p16Medium,
  setCssVar('currentTextColor', cssVar('errorColor'))
);

const iconWrapperStyles = css({
  ...setCssVar('iconBackgroundColor', red100.rgb),
  ...setCssVar('currentTextColor', red500.rgb),

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
    <p contentEditable={false} css={errorStyles}>
      <span css={iconWrapperStyles}>
        <Warning />
      </span>{' '}
      {error instanceof Error ? error.message : error}
    </p>
  ) : (
    <CodeError message={error instanceof Error ? error.message : error} />
  );
