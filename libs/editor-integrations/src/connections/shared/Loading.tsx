import { cssVar, p14Regular } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC } from 'react';
import { ConnectionProps } from '../types';

const extractError = (err: string | Error): string => {
  if (typeof err === 'string') {
    return err;
  }
  return err.message;
};

export const Loading: FC<Pick<ConnectionProps, 'info'>> = ({ info }) => {
  const lastLog = info.at(-1);

  if (lastLog == null) {
    return null;
  }

  switch (lastLog.status) {
    case 'run':
    case 'success':
      return <></>;
    case 'warning':
    case 'error':
      return <LoadingDiv>{extractError(lastLog.err)}</LoadingDiv>;
    case 'unset':
    case 'log':
      return null;
  }
};

const LoadingDiv = styled.div(p14Regular, {
  display: 'flex',
  marginTop: '8px',
  wordBreak: 'break-word',
  gap: '8px',
  svg: {
    width: '16px',
    height: '16px',
  },
  color: cssVar('stateDangerText'),
  border: `1px solid ${cssVar('stateDangerBackground')}`,
  borderRadius: '8px',
  background: cssVar('stateDangerBackground'),
  padding: '4px 8px',
});
