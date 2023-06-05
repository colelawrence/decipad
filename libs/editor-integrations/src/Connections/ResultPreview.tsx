import { Result } from '@decipad/computer';
import {
  CodeResult,
  ContentEditableInput,
  LiveCode,
  cssVar,
} from '@decipad/ui';
import { FC } from 'react';

interface ResultPreviewProps {
  result?: Result.Result;
  name: string;
  setName: (n: string) => void;
}

export const ResultPreview: FC<ResultPreviewProps> = ({
  result,
  name,
  setName,
}) => {
  return (
    <div
      css={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          border: `1px solid ${cssVar('highlightColor')}`,
          borderRadius: 12,
          padding: 16,
          height: '100%',
          div: {
            margin: 0,
          },
          ' div > span': {
            maxWidth: 'unset',
            overflow: 'initial',
            whiteSpace: 'normal',
          },
        },
      ]}
    >
      {result && (
        <LiveCode>
          <ContentEditableInput
            value={name}
            onChange={(newValue) => {
              setName(newValue);
            }}
          />
        </LiveCode>
      )}
      <div>
        {result ? (
          <CodeResult type={result.type} value={result.value} variant="block" />
        ) : (
          'No results to preview. Did you forget to run?'
        )}
      </div>
    </div>
  );
};
