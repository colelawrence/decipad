import styled from '@emotion/styled';
import { Button } from '../../atoms';
import { cssVar } from '../../primitives';
import { SearchBar } from '../../molecules';
import { Plus, Users } from '../../icons';
import { HelpMenu } from '@decipad/ui';
import { docs } from '@decipad/routing';
import { useSession } from 'next-auth/react';
import { useCanUseDom } from '@decipad/react-utils';

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
              variant="workspace"
            />
          </div>
        )}
        <Button href={membersHref} type="secondary">
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
            <Plus variant="black" />
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
    backgroundColor: cssVar('backgroundSubdued'),
  },
  'span:has(> svg)': {
    display: 'none',
  },
});

const TextWithIcon = styled.div({
  whiteSpace: 'nowrap',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  lineHeight: 'normal',

  svg: {
    height: '1.231em',
    width: '1.231em',
  },
});
