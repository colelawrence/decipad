import styled from '@emotion/styled';
import { ClosableModal } from '../../organisms';
import { cssVar, p14Bold, p14Regular, p32Medium } from '../../primitives';
import { Button } from '../../atoms';
import { DeciBoxesFilled } from '../../icons';

type EditMembersPaywallProps = {
  closeHref: string;
  paymentHref: string;
};

export const EditMembersPaywall: React.FC<EditMembersPaywallProps> = ({
  closeHref,
  paymentHref,
}) => {
  return (
    <ClosableModal noHeader closeAction={closeHref}>
      <ModalContent>
        <Section>
          <Heading>Upgrade to Pro</Heading>
          <Paragraph>$15 per seat per month</Paragraph>
        </Section>

        <DeciDecoration children={<DeciBoxesFilled />} />

        <FeaturesCard>
          <Section>
            <SubHeading>Modeling Features</SubHeading>
            <List>
              <li>Natural language formulas</li>
              <li>Tables & Pivot Tables</li>
              <li>Widgets, Charts and Data Visualizations</li>
              <li>Unit Conversions</li>
              <li>Dimensions</li>
            </List>
          </Section>

          <Section>
            <SubHeading>Data Integrations</SubHeading>
            <List>
              <li>CSV Uploads: up to 10k cells</li>
              <li>Media Uploads: up to 5MB</li>
              <li>Live Connections: 500 queries / month</li>
            </List>
          </Section>

          <Section>
            <SubHeading>Collaboration</SubHeading>
            <List>
              <li>Everything in Starter</li>
              <li>Shared Workspace: Unlimited seats</li>
              <li>Guest Collaborators: 10x per notebook</li>
            </List>
          </Section>
        </FeaturesCard>

        <Button
          type="yellow"
          href={paymentHref}
          sameTab={true} // change this to false if you want to work on payments locally
          testId="paywall_upgrade_pro"
        >
          Upgrade to Pro
        </Button>
      </ModalContent>
    </ClosableModal>
  );
};

const ModalContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '8px 40px',
  position: 'relative',
  overflow: 'hidden',
});

const FeaturesCard = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px 24px',
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
});

const Section = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const Heading = styled.h3(p32Medium, {
  letterSpacing: '-0.03em',
  color: cssVar('spoilerColor'),
});

const SubHeading = styled.h4(p14Bold, {
  color: cssVar('normalTextColor'),
});

const Paragraph = styled.p(p14Regular, {
  color: cssVar('normalTextColor'),
});

const List = styled.ul(p14Regular, {
  alignSelf: 'flex-start',
  color: cssVar('normalTextColor'),
  listStyle: 'inside',

  '> li::marker': {
    content: '""',
  },
});

const DeciDecoration = styled.div({
  position: 'absolute',
  top: '24px',
  right: '24px',
  height: '24px',
  width: '24px',
  pointerEvents: 'none',
});
