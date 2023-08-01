import React, { useCallback, useState } from 'react';
import { Secret } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { Trash } from '../../icons';
import { IconButton } from '../../atoms';
import { cssVar, p14Medium } from '../../primitives';

type RowProps = {
  secret: Secret;
  onRemove: (secret: Secret) => Promise<void>;
};

export const WorkspaceSecretsRow: React.FC<RowProps> = ({
  secret,
  onRemove,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(() => {
    setLoading(true);
    onRemove(secret).catch(() => {
      setLoading(false);
    });
  }, [secret, onRemove]);

  const containerStyles = [secretRowStyles, loading && secretRowInactiveStyles];

  return (
    <div css={containerStyles} key={secret.id}>
      <div css={secretNameStyles}>{secret.name}</div>

      <div css={columnPermissionStyles}>
        <IconButton
          onClick={handleDelete}
          roleDescription="delete secret"
          roundedSquare
          transparent
        >
          <Trash />
        </IconButton>
      </div>
    </div>
  );
};

const secretNameStyles = css(p14Medium, {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
});

const columnPermissionStyles = css({
  alignSelf: 'center',
  justifySelf: 'end',

  svg: {
    height: '14px',
    width: '14px',
  },
});

const rowStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
});

const secretRowStyles = css(rowStyles, {
  padding: '4px 8px',
  borderRadius: '6px',
  margin: '0 -8px',

  ':hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },

  svg: { opacity: 0.4 },
  ':hover svg': { opacity: 1 },
});

const secretRowInactiveStyles = css({
  opacity: 0.4,
});
