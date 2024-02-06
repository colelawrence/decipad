import { useAiUsage } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared';
import { Deci } from '../../../icons';
import {
  componentCssVars,
  cssVar,
  p14Medium,
  p32Medium,
} from '../../../primitives';
import { RainbowText } from '../../../styles/card';
import { WorkspaceHeroHeader } from './WorkspaceHeroHeader.private';

type WorkspaceHeroProps = {
  name: string;
  isPremium: boolean;
  planName: string;
  creditsPlan: number;
  membersCount: number;
  membersHref?: string;
  creditsHref?: string;
  onCreateNotebook?: () => void;
};

export const WorkspaceHero: React.FC<WorkspaceHeroProps> = ({
  name,
  isPremium,
  membersCount,
  planName,
  creditsPlan,
  membersHref,
  creditsHref,
  onCreateNotebook,
}) => {
  const plan = isPremium ? <span css={RainbowText}>{planName}</span> : planName;
  const members = <MembersCounter number={membersCount} />;
  const navigate = useNavigate();
  const { promptTokensUsed, completionTokensUsed, tokensQuotaLimit } =
    useAiUsage();

  const limit = tokensQuotaLimit ?? creditsPlan;
  const creditsUsed = Math.floor(
    (promptTokensUsed + completionTokensUsed) / 2_000
  );
  const creditsLeft = Math.max(0, limit - creditsUsed);

  const credits = (
    <>
      {' '}
      •{' '}
      <span>
        <CreditsLabel>Credits</CreditsLabel>
        <CreditsLeft noCreditsLeft={creditsLeft === 0}>
          {creditsLeft}
        </CreditsLeft>
        <Button
          type="secondary"
          styles={addMoreCreditsButton}
          onClick={() => creditsHref && navigate(creditsHref)}
        >
          Buy more
        </Button>
      </span>
    </>
  );

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
        {members} • {plan} {credits}
      </StatusLine>
    </Container>
  );
};

const MembersCounter: React.FC<{ number: number }> = ({ number }) =>
  number === 1 ? <>{number} member</> : <>{number} members</>;

const addMoreCreditsButton = css({
  borderRadius: '4px',
  padding: '2px 4px',
  lineHeight: '1.4',
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  color: componentCssVars('ButtonTertiaryAltDefaultText'),
  display: 'inline',
});

const Container = styled.div({
  padding: '14px 16px 64px 42px',
  backgroundColor: cssVar('backgroundSubdued'),
  borderBottom: `1px solid ${cssVar('borderSubdued')}`,
});

const DeciLogo = styled.div({
  height: '36px',
  width: '36px',
  marginTop: '42px',
  marginBottom: '24px',
});

const Title = styled.h2(p32Medium, {
  color: cssVar('textHeavy'),
});

const StatusLine = styled.div(p14Medium, {
  marginTop: '8px',
  color: cssVar('textSubdued'),
});

const CreditsLabel = styled.p({
  display: 'inline',
  color: cssVar('textDisabled'),
});

const CreditsLeft = styled.p<{ noCreditsLeft: boolean }>((props) => ({
  display: 'inline',
  marginLeft: '6px',
  marginRight: '6px',
  padding: '2px 4px',
  borderRadius: '4px',
  backgroundColor: props.noCreditsLeft
    ? componentCssVars('ErrorBlockError')
    : componentCssVars('ButtonTertiaryAltDefaultBackground'),
  color: componentCssVars('ButtonTertiaryAltDefaultText'),
}));
