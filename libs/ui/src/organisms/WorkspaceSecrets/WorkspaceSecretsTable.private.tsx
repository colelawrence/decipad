import { Secret } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { p14Medium } from '../../primitives';
import { WorkspaceSecretsRow } from './WorkspaceSecretsRow.private';

type TableProps = {
  readonly secrets?: Secret[];
  readonly onRemove: (secret: Secret) => Promise<void>;
};

export const WorkspaceSecretsTable = ({ secrets, onRemove }: TableProps) => {
  if (!secrets || secrets.length < 1) {
    return null;
  }

  return (
    <div css={tableStyles}>
      <div css={rowStyles}>
        <div css={tableHeadStyles}>Existing secrets</div>
        <div css={tableHeadStyles}>Options</div>
      </div>

      {secrets.map((secret) => (
        <WorkspaceSecretsRow
          key={secret.id}
          secret={secret}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const tableStyles = css({
  margin: '16px 0',
  marginTop: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const rowStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
});

const tableHeadStyles = css(p14Medium);
