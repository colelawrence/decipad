import { FC, useState } from 'react';
import { css } from '@emotion/react';
import { inputStyles, MessageBlock } from '.';
import { Sparkles, Warning } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';

interface DatabaseQueryProps {
  connection?: 'success' | 'error';

  query: string;
  setQuery: (q: string) => void;

  state?: 'error' | 'success';
  message?: string;
}

export const DatabaseQuery: FC<DatabaseQueryProps> = ({
  connection,

  query,
  setQuery,

  state,
  message,
}) => {
  const [locked, setLocked] = useState(state === 'success');

  return (
    <div css={wrapperStyles}>
      {connection === 'success' && (
        <MessageBlock
          type="success"
          icon={<Sparkles />}
          title="Connection active"
        />
      )}
      {connection === 'error' && (
        <MessageBlock
          type="error"
          icon={<Sparkles />}
          title="Connected failed"
        />
      )}
      <textarea
        {...(locked && { 'aria-details': 'locked' })}
        readOnly={locked}
        onDoubleClick={() => setLocked(false)}
        css={[inputStyles, textareaStyles]}
        rows={4}
        placeholder="SELECT * FROM users ..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {state ? (
        <MessageBlock
          type={state}
          icon={state === 'error' ? <Warning /> : <Sparkles />}
          title={state === 'error' ? 'Query error: ' : 'Success: '}
          message={
            message ??
            'An error has occured, check your syntax or contact support'
          }
        />
      ) : (
        <MessageBlock
          type="warning"
          icon={<Warning />}
          title="Current Data Import Limits: "
          message="We only support a certain number of rows"
        />
      )}
    </div>
  );
};

const wrapperStyles = css({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const textareaStyles = css(p13Medium, {
  fontFamily: 'monospace',
  resize: 'none',
  paddingTop: '12px',
  paddingBottom: '12px',
  '&[aria-details="locked"]': {
    border: `1px solid ${cssVar('toastOk')}`,
  },
});
