import { Button, cssVar, isValidURL, sanitizeInput } from '@decipad/ui';
import { assertInstanceOf } from '@decipad/utils';
import styled from '@emotion/styled';
import { FC, useMemo, useRef } from 'react';
import { URLRunner } from '../../runners';
import { ConnectionProps } from '../types';

export const FromUrl: FC<ConnectionProps> = ({ runner, onRun }) => {
  assertInstanceOf(runner, URLRunner);

  const inputUrlRef = useRef<HTMLInputElement>(null);

  const isValidUrl = useMemo(() => {
    const url = inputUrlRef.current?.value;
    return url != null && isValidURL(url);
  }, [inputUrlRef]);

  const onImportUrl = async () => {
    const url = inputUrlRef.current?.value;
    if (url == null || !isValidURL(url)) {
      console.error('Url is not provided');
      return;
    }
    const sanitizedUrl = sanitizeInput({ input: url, isURL: true });

    runner.setUrl(sanitizedUrl);
    onRun();
  };

  return (
    <Wrapper>
      <input ref={inputUrlRef} type="text" placeholder="Google Sheet URL" />
      <Button type="primary" onClick={onImportUrl} disabled={!isValidUrl}>
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
