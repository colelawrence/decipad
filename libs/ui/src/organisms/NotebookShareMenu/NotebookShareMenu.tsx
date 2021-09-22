import { css } from '@emotion/react';
import { FC, useRef, useState } from 'react';

import { Button } from '../../atoms';
import { p13Regular } from '../../primitives';
import { noop } from '../../utils';

interface NotebookShareMenuProps {
  readonly link: string;
  readonly onShareWithEmail?: (
    email: string,
    write: boolean
  ) => void | Promise<void>;
}

export const NotebookShareMenu = ({
  link,
  onShareWithEmail = noop,
}: NotebookShareMenuProps): ReturnType<FC> => {
  const [write, setWrite] = useState(false);
  const [email, setEmail] = useState('');
  const [emailPending, setEmailPending] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div role="dialog" aria-label="Share notebook" css={css(p13Regular)}>
      <p>
        This link will allow anyone to read, but not edit this notebook, even if
        they do not have a Deci account:
      </p>
      <pre
        css={{
          userSelect: 'all',
          overflowX: 'clip',
          '@supports not (overflow-x: clip)': {
            overflowX: 'hidden',
          },
          textOverflow: 'ellipsis',
        }}
      >
        <code>{link}</code>
      </pre>
      <form ref={formRef}>
        <p>Or share using someone's email:</p>
        <label>
          <input
            type="email"
            disabled={emailPending}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Allow editing
          <input
            type="checkbox"
            disabled={emailPending}
            checked={write}
            onChange={() => setWrite(!write)}
          />
        </label>
        <Button
          disabled={emailPending}
          primary
          onClick={async () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!formRef.current!.reportValidity()) {
              return;
            }
            try {
              setEmailPending(true);
              await onShareWithEmail(email, write);
            } finally {
              setEmailPending(false);
            }
          }}
        >
          Send email
        </Button>
      </form>
    </div>
  );
};

// TODO design system inputs
// TODO design system component for button that opens menu?
// TODO fix email bugs
// TODO test
