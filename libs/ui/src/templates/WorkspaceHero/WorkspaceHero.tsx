import styled from '@emotion/styled';
import { Deci } from '../../icons';
import { cssVar, p14Medium, p32Medium } from '../../primitives';
import { RainbowText } from '../../styles/card';
import { WorkspaceHeroHeader } from './WorkspaceHeroHeader.private';

type WorkspaceHeroProps = {
  name: string;
  isPremium: boolean;
  membersCount: number;
  membersHref?: string;
  onCreateNotebook?: () => void;
};

export const WorkspaceHero: React.FC<WorkspaceHeroProps> = ({
  name,
  isPremium,
  membersCount,
  membersHref,
  onCreateNotebook,
}) => {
  const plan = isPremium ? (
    <span css={RainbowText}>Pro Plan</span>
  ) : (
    'Free plan'
  );
  const members = <MembersCounter number={membersCount} />;

  return (
    <Container>
      <WorkspaceHeroHeader
        membersHref={membersHref}
        onCreateNotebook={onCreateNotebook}
      />

      <DeciLogo children={<Deci />} />
      <div data-testid="workspace-hero-title">
        <Title>
          Welcome to
          <br />
          {name}
        </Title>
      </div>

      <StatusLine>
        {members} • {plan}
      </StatusLine>
    </Container>
  );
};

const MembersCounter: React.FC<{ number: number }> = ({ number }) =>
  number === 1 ? <>{number} member</> : <>{number} members</>;

const Container = styled.div({
  padding: '14px 16px 64px 42px',
  backgroundColor: cssVar('tintedBackgroundColor'),
  borderBottom: `1px solid ${cssVar('borderColor')}`,
});

const DeciLogo = styled.div({
  height: '36px',
  width: '36px',
  marginTop: '42px',
  marginBottom: '24px',
});

const Title = styled.h2(p32Medium, {
  color: cssVar('spoilerColor'),
  lineHeight: 1.1,
});

const StatusLine = styled.div(p14Medium, {
  marginTop: '8px',
  color: cssVar('weakTextColor'),
});
