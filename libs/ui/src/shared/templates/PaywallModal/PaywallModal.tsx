import styled from '@emotion/styled';

import { cssVar, p14Medium, p14Regular } from '../../../primitives';
import { Modal } from '../../molecules';
import { ComponentProps } from 'react';
import { Button } from '../../atoms';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  paymentHref: string;
};

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  paymentHref,
}) => {
  return (
    <Modal
      title="Upgrade to Pro"
      defaultOpen={true}
      onClose={onClose}
      testId="upgrade-pro-modal"
    >
      <ModalContent>
        <Subtitle>$15 per seat per month</Subtitle>
        <Section>
          <SectionHeading>Modeling Features</SectionHeading>
          <List>
            <li>Natural language formulas</li>
            <li>Tables & Pivot Tables</li>
            <li>Widgets, Charts and Data Visualizations</li>
            <li>Unit Conversions</li>
            <li>Dimensions</li>
          </List>
        </Section>

        <Section>
          <SectionHeading>Data Integrations</SectionHeading>
          <List>
            <li>CSV Uploads: up to 10k cells</li>
            <li>Media Uploads: up to 5MB</li>
            <li>Live Connections: 500 queries / month</li>
          </List>
        </Section>

        <Section>
          <SectionHeading>Collaboration</SectionHeading>
          <List>
            <li>Everything in Starter</li>
            <li>Shared Workspace: Unlimited seats</li>
            <li>Guest Collaborators: 10x per notebook</li>
          </List>
        </Section>

        <ButtonContainer>
          <Button
            type="primaryBrand"
            href={paymentHref}
            sameTab={true} // change this to false if you want to work on payments locally
            testId="paywall_upgrade_pro"
          >
            Upgrade to Pro
          </Button>
          <Button type="secondary" onClick={onClose}>
            Maybe Later
          </Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minWidth: '400px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
});

export const Subtitle = styled.h3(p14Medium, {
  color: cssVar('textSubdued'),
  marginBottom: '24px',
});

const Section = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: '16px',
  width: '100%',
  borderRadius: '12px',
  marginBottom: '8px',
  gap: '4px',
  backgroundColor: cssVar('backgroundDefault'),
});

const SectionHeading = styled.h4(p14Medium, {
  color: cssVar('textHeavy'),
});

const ButtonContainer = styled.div({
  display: 'flex',
  marginTop: '16px',
  gap: '8px',
});

const List = styled.ul(p14Regular, {
  alignSelf: 'flex-start',
  color: cssVar('textSubdued'),
  listStyle: 'inside',
  paddingLeft: '8px',
});
