import { css } from '@emotion/react';
import { FC } from 'react';
import { CodeError, Spinner } from '../../atoms';

const importWrapperStyles = css({
  paddingTop: '20px',
});

interface ImportProps {
  url: string;
  fetching: boolean;
  error?: string;
}

export const Import: FC<ImportProps> = ({ fetching, error }) => {
  return (
    <div contentEditable={false} css={importWrapperStyles}>
      {fetching && <Spinner />}
      {error && <CodeError message={error} url="/docs" />}
    </div>
  );
};
