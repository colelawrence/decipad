import { Button, cssVar, Input, isValidURL, sanitizeInput } from '@decipad/ui';
import styled from '@emotion/styled';
import { FC, useMemo, useState } from 'react';
import { ConnectionProps } from '../types';
import { isRunnerOfType } from '@decipad/notebook-tabs';

export const FromUrl: FC<ConnectionProps> = ({ runner, onRun }) => {
  const [url, setUrl] = useState<string>('');

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
      <Input
        variant="small"
        value={url}
        onChangeValue={setUrl}
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
