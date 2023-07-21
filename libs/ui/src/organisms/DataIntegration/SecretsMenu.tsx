import { FC, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { MenuList } from '../../molecules';
import { ArrowDiagonalTopRight, Caret } from '../../icons';
import { editorLayout } from '../../styles';
import { cssVar, p12Bold, p12Medium, p13Medium } from '../../primitives';
import { Divider, MenuItem } from '../../atoms';
import { Anchor } from '../../utils';

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
    setSecretsOpen(false);
    setTimeout(() => {
      navigate(workspaces({}).workspace({ workspaceId }).connections({}).$, {
        replace: true,
      });
    }, 0);
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
        <div css={secretsWarning}>
          Secrets may only be used directly in the{' '}
          <strong css={p12Bold}>fetch() </strong>
          statement. Learn more{' '}
          {/*
              Ok, this is very bad.
              The problem is that the `MenuList`, has a `onClick={e => e.preventDefault()}`,
              Which is preventing the regular browser behavior.
              Removing it is mostly ok EXCEPT for the workspace, clicking on the options menu on the notebook lists.
              But this is tech debt, we should remove onclick and fix the notebook workspace one instead.
          */}
          <Anchor
            href="https://app.decipad.com/docs/integrations/code"
            onClick={() => {
              window.open(
                'https://app.decipad.com/docs/integrations/code',
                '_blank'
              );
            }}
          >
            <span>in our documentation</span>
          </Anchor>
        </div>

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
          <span>API Secrets</span>
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

const secretsWarning = css(p12Medium, {
  maxWidth: '132px',
  backgroundColor: cssVar('mutationAnimationColor'),
  borderRadius: '6px',
  padding: '6px',
  span: {
    textDecoration: 'underline',
  },
});
