import { useCanUseDom } from '@decipad/react-utils';
import { docs } from '@decipad/routing';
import styled from '@emotion/styled';
import { useSession } from 'next-auth/react';
import { Button, SearchBar, HelpMenu } from '../../../shared';
import { Add, Users } from '../../../icons';

import { cssVar } from '../../../primitives';

type WorkspaceHeroHeaderProps = {
  membersHref?: string;
  onCreateNotebook?: () => void;
};

export const WorkspaceHeroHeader: React.FC<WorkspaceHeroHeaderProps> = ({
  membersHref,
  onCreateNotebook,
}) => {
  const { status: sessionStatus } = useSession();
  const canUseDom = useCanUseDom();
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
        <Button href={membersHref} type="tertiaryAlt">
          <TextWithIcon>
            <Users />
            <span>Invite team</span>
          </TextWithIcon>
        </Button>

        <Button
          type="primaryBrand"
          onClick={onCreateNotebook}
          testId="new-notebook"
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
