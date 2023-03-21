import { FC } from 'react';
import { Button, CodeError } from '@decipad/ui';
import { css } from '@emotion/react';
import { isFlagEnabled } from '@decipad/feature-flags';

const liveConnectionErrorWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  width: '50%',
});

interface LiveConnectionErrorProps {
  error: Error;
  errorURL: string;
  onRetry: () => void;
  onAuthenticate: () => void;
}

const permissionDeniedMessageMatchers = ['permission', 'auth', 'forbidden'];

const isPermissionError = (err: Error): boolean => {
  const message = err.message.toLocaleLowerCase();
  return !!permissionDeniedMessageMatchers.find((matcher) =>
    message.includes(matcher)
  );
};

export const LiveConnectionError: FC<LiveConnectionErrorProps> = ({
  error,
  errorURL,
  onRetry,
  onAuthenticate,
}) => {
  console.error(error);
  return (
    <div css={liveConnectionErrorWrapperStyles}>
      {error.message?.includes('Could not find the result') ? (
        <CodeError
          message={"We don't support importing this block type yet"}
          url={'/docs/'}
        />
      ) : (
        <CodeError
          message={error.message || "There's an error in the source document"}
          defaultDocsMessage={'Go to source'}
          url={errorURL}
        />
      )}
      <Button size="extraSlim" onClick={onRetry}>
        Retry
      </Button>
      {isFlagEnabled('INTEGRATIONS_AUTH') && isPermissionError(error) && (
        <Button size="extraSlim" onClick={onAuthenticate}>
          Authenticate
        </Button>
      )}
    </div>
  );
};
