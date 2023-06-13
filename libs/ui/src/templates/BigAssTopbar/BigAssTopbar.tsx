import styled from '@emotion/styled';
import { cssVar, p14Medium, p32Medium } from '../../primitives';
import { Deci } from '../../icons';
import { BigAssTopbarHeader } from './BigAssTopbarHeader.private';

type BigAssTopbarProps = {
  name: string;
  isPremium: boolean;
  numberOfMembers: number;
  membersHref?: string;
  onCreateNotebook?: () => void;
};

export const BigAssTopbar: React.FC<BigAssTopbarProps> = ({
  name,
  isPremium,
  numberOfMembers,
  membersHref,
  onCreateNotebook,
}) => {
  const plan = isPremium ? <RainbowText>Pro Plan</RainbowText> : 'Free plan';
  const members = <MembersCounter number={numberOfMembers} />;

  return (
    <Container>
      <BigAssTopbarHeader
        membersHref={membersHref}
        onCreateNotebook={onCreateNotebook}
      />

      <DeciLogo children={<Deci />} />
      <Title>
        Welcome to
        <br />
        {name}
      </Title>

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

const RainbowText = styled.span({
  background: `linear-gradient(268.09deg, #C1FA6B -0.35%, #A9FF28 -0.34%, #E9C711 85.21%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});
