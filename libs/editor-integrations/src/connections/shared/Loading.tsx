import { useExecutionContext } from '@decipad/react-contexts';
import { LoadingIndicator, p14Bold } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC } from 'react';

const extractError = (err: string | Error): string => {
  if (typeof err === 'string') {
    return err;
  }
  return err.message;
};

export const Loading: FC = () => {
  const { info } = useExecutionContext();
  const lastLog = info.at(-1);

  if (lastLog == null) {
    return null;
  }

  switch (lastLog.status) {
    case 'run':
      return (
        <LoadingDiv>
          Loading <LoadingIndicator />
        </LoadingDiv>
      );
    case 'success':
      return <LoadingDiv>Integration loaded successfully!</LoadingDiv>;
    case 'warning':
    case 'error':
      return (
        <LoadingDiv>
          There was an error loading the integration: <br />
          {extractError(lastLog.err)}
        </LoadingDiv>
      );
    case 'unset':
    case 'log':
      return null;
  }
};

const LoadingDiv = styled.div(p14Bold, {
  display: 'flex',
  marginTop: '8px',
  gap: '8px',
  svg: {
    width: '16px',
    height: '16px',
  },
});
