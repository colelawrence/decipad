import { Button, cssVar, isValidURL, sanitizeInput } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { ConnectionProps } from '../types';
import { isRunnerOfType } from '../../runners';

export const FromUrl: FC<ConnectionProps> = ({ runner, onRun }) => {
  const inputUrlRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>('');

  const handleInputChange = useCallback(() => {
    const newUrl = inputUrlRef.current?.value || '';
    setUrl(newUrl);
  }, []);

  const isValidUrl = useMemo(() => {
    return url != null && isValidURL(url);
  }, [url]);

  const onImportUrl = async () => {
    if (url == null || !isValidURL(url)) {
      console.error('Url is invalid or not provided');
      return;
    }
    if (!isRunnerOfType(runner, 'gSheets')) {
      console.error('runner is not gsheets!');
      return;
    }
    const sanitizedUrl = sanitizeInput({ input: url, isURL: true });

    runner.setOptions({ runner: { spreadsheetUrl: sanitizedUrl } });
    onRun();
  };

  return (
    <Wrapper>
      <input
        ref={inputUrlRef}
        onChange={handleInputChange}
        type="text"
        placeholder="Google Sheet URL"
      />
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
