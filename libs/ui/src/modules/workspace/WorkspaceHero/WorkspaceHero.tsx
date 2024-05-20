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
import { PermissionType } from 'libs/ui/src/types';

type WorkspaceHeroProps = {
  name: string;
  isPremium: boolean;
  planName: string;
  membersCount: number;
  membersHref?: string;
  creditsHref?: string;
  permissionType?: PermissionType | null;
  onCreateNotebook?: () => void;

  hasReachedAiLimit: boolean;
  aiCreditsLeft: number;
};

export const WorkspaceHero: React.FC<WorkspaceHeroProps> = ({
  name,
  isPremium,
  membersCount,
  planName,
  membersHref,
  creditsHref,
  onCreateNotebook,
  permissionType,

  hasReachedAiLimit,
  aiCreditsLeft,
}) => {
  const plan = isPremium ? <span css={RainbowText}>{planName}</span> : planName;
  const members = <MembersCounter number={membersCount} />;
  const navigate = useNavigate();

  const credits = (
    <>
      {' '}
      •{' '}
      <span>
        <CreditsLabel>Credits</CreditsLabel>
        <CreditsLeft noCreditsLeft={hasReachedAiLimit}>
          {isNaN(aiCreditsLeft) ? '∞' : Math.ceil(aiCreditsLeft)}
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
        permissionType={permissionType}
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
  padding: '16px 16px 64px 44px',

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
