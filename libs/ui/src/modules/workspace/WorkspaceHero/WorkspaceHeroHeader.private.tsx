import { useCanUseDom, usePromise } from '@decipad/react-utils';
import { docs } from '@decipad/routing';
import styled from '@emotion/styled';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Button, SearchBar, HelpMenu } from '../../../shared';
import { Add, Users } from '../../../icons';
import { analytics } from '@decipad/client-events';
import { cssVar } from '../../../primitives';
import { PermissionType } from 'libs/ui/src/types';
import { useToast } from '@decipad/toast';
import { captureException } from '@sentry/react';

type WorkspaceHeroHeaderProps = {
  membersHref?: string;
  onCreateNotebook?: () => Promise<void>;
  permissionType?: PermissionType | null;
};

export const WorkspaceHeroHeader: React.FC<WorkspaceHeroHeaderProps> = ({
  membersHref,
  onCreateNotebook,
  permissionType,
}) => {
  const [createNotebookPromise, setCreateNotebookPromise] = useState<
    Promise<unknown> | undefined
  >();
  const { status: sessionStatus } = useSession();
  const canUseDom = useCanUseDom();

  const innerCreateNotebook = useCallback(() => {
    setCreateNotebookPromise(onCreateNotebook?.());
  }, [onCreateNotebook]);

  const [, loading, error] = usePromise(createNotebookPromise);

  const toast = useToast();
  useEffect(() => {
    if (error) {
      console.error(error);
      captureException(error);
      toast.error('Failed to create notebook');
    }
  });

  return (
    <Container>
      <SearchBarRestyle>
        <SearchBar compact />
      </SearchBarRestyle>

      <Buttons>
        {canUseDom && sessionStatus === 'authenticated' && (
          <div>
            <HelpMenu
              discordUrl="http://discord.gg/decipad"
              docsUrl={docs({}).$}
              releaseUrl={docs({}).page({ name: 'releases' }).$}
            />
          </div>
        )}
        {permissionType === 'ADMIN' && (
          <Button
            href={membersHref}
            type="tertiaryAlt"
            onClick={() => {
              analytics.track({
                type: 'action',
                action: 'Invite Team Button Clicked',
                props: {
                  analytics_source: 'frontend',
                },
              });
            }}
          >
            <TextWithIcon>
              <Users />
              <span>Invite team</span>
            </TextWithIcon>
          </Button>
        )}

        <Button
          type="primaryBrand"
          onClick={innerCreateNotebook}
          testId="new-notebook"
          disabled={loading}
        >
          <TextWithIcon>
            <Add />
            <span>New Notebook</span>
          </TextWithIcon>
        </Button>
      </Buttons>
    </Container>
  );
};

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 'fit-content',
  width: '100%',

  gap: '24px',
});

const Buttons = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

const SearchBarRestyle = styled.div({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',

  '> div': {
    display: 'flex',
  },
  input: {
    backgroundColor: cssVar('backgroundMain'),
  },
});

const TextWithIcon = styled.div({
  whiteSpace: 'nowrap',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',

  svg: {
    height: 'max(1.2em, 16px)',
    width: 'max(1.2em, 16px)',
  },
});
