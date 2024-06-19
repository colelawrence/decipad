import { Button, cssVar } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC, useRef } from 'react';
import { ConnectionProps } from '../types';
import { assertInstanceOf } from '@decipad/utils';
import { URLRunner } from '../../runners';

export const FromUrl: FC<ConnectionProps> = ({ runner, onRun }) => {
  assertInstanceOf(runner, URLRunner);

  const inputUrlRef = useRef<HTMLInputElement>(null);

  const onImportUrl = async () => {
    const url = inputUrlRef.current?.value;
    if (url == null) {
      console.error('Url is not provided');
      return;
    }

    runner.setUrl(url);
    onRun();
  };

  return (
    <Wrapper>
      <input ref={inputUrlRef} type="text" placeholder="Google Sheet URL" />
      <Button type="primary" onClick={onImportUrl}>
        Import
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.div({
  display: 'flex',
  gap: '8px',

  button: {
    width: '120px',
  },

  input: {
    width: '100%',

    backgroundColor: cssVar('backgroundDefault'),
    borderRadius: '6px',
    padding: '6px 12px',
    border: `1px solid ${cssVar('borderDefault')}`,
  },
});
