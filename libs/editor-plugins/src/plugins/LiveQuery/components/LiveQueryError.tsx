import { FC } from 'react';
import { Button, CodeError } from '@decipad/ui';
import { css } from '@emotion/react';

const liveConnectionErrorWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  width: '50%',
});

interface LiveQueryErrorProps {
  error: string;
  errorURL: string;
  onRetry: () => void;
}

export const LiveQueryError: FC<LiveQueryErrorProps> = ({
  error,
  errorURL,
  onRetry,
}) => {
  console.error(error);
  return (
    <div css={liveConnectionErrorWrapperStyles}>
      <CodeError
        message={error || 'There was an error running the query'}
        defaultDocsMessage={'Go to source'}
        url={errorURL}
      />
      <Button size="extraSlim" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
};
