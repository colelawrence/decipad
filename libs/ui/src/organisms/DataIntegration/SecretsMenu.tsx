import { FC, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { MenuList } from '../../molecules';
import { ArrowDiagonalTopRight, Caret } from '../../icons';
import { editorLayout } from '../../styles';
import { cssVar, p13Medium } from '../../primitives';
import { Divider, MenuItem } from '../../atoms';

interface SecretsMenuProps {
  workspaceId: string;
  onAddSecret: (secretName: string) => void;
}

export const SecretsMenu: FC<SecretsMenuProps> = ({
  workspaceId,
  onAddSecret,
}) => {
  const [secretsOpen, setSecretsOpen] = useState(false);

  const { secrets } = useWorkspaceSecrets(workspaceId);
  const navigate = useNavigate();

  const onNavigateToSecrets = useCallback(() => {
    navigate(workspaces({}).workspace({ workspaceId }).connections({}).$, {
      replace: true,
    });
  }, [navigate, workspaceId]);

  return (
    <div css={wrapperStyles}>
      <MenuList
        root
        dropdown
        open={secretsOpen}
        sideOffset={12}
        onChangeOpen={setSecretsOpen}
        trigger={
          <span css={categoryAndCaretStyles}>
            <span css={p13Medium}>
              {/* Without text the icon has no line height, and so floats
                            upwards, hence the non-breaking space */}
              {'\uFEFF'}
              Insert Secret
            </span>
            <span css={iconStyles} data-testid="insert-secret-button">
              <Caret variant="down" />
            </span>
          </span>
        }
      >
        {secrets &&
          secrets.map(({ name }) => (
            <MenuItem
              key={name}
              onSelect={() => {
                onAddSecret(name);
              }}
            >
              <span>{name}</span>
            </MenuItem>
          ))}

        {secrets && secrets.length > 0 && (
          <div role="presentation" css={hrStyles}>
            <Divider />
          </div>
        )}

        <MenuItem
          icon={<ArrowDiagonalTopRight />}
          onSelect={onNavigateToSecrets}
        >
          <span>Integration Secrets</span>
        </MenuItem>
      </MenuList>
    </div>
  );
};

const wrapperStyles = css({
  display: 'inline-block',
  cursor: 'pointer',
});

const categoryAndCaretStyles = css([
  editorLayout.hideOnPrint,
  {
    width: '100%',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'space-between',
    paddingLeft: '8px',
  },
]);

const hrStyles = css({
  padding: '4px 0px',
  textOverflow: 'ellipsis',
  transform: 'translateX(0px)',
  width: '100%',
  hr: {
    boxShadow: `0 0 0 0.5px ${cssVar('borderColor')}`,
  },
});

const iconStyles = css({
  width: 18,
  display: 'grid',
});
