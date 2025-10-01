import { FC, useEffect } from 'react';
import * as Styled from './styles';
import { analytics } from '@decipad/client-events';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';

export const SubscriptionPayment: FC = () => {
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  useEffect(() => {
    setIsUpgradeWorkspaceModalOpen(false);
    analytics.track({
      type: 'action',
      action: 'Checkout Modal Viewed',
      props: {
        analytics_source: 'frontend',
      },
    });
  }, [setIsUpgradeWorkspaceModalOpen]);

  return (
    <Styled.PaymentFormWrapper>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Payment Processing Disabled</h2>
        <p>
          Payment processing is currently disabled. Please contact support for
          assistance.
        </p>
      </div>
    </Styled.PaymentFormWrapper>
  );
};
