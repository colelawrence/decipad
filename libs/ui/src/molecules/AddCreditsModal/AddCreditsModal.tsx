import { useGetNotebookMetaQuery } from '@decipad/graphql-client';
import { notebooks, useRouteParams } from '@decipad/routing';
import styled from '@emotion/styled';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ClosableModal } from '../../organisms';
import { cssVar, p14Regular, p18Medium } from '../../primitives';
import { AddCreditsPaymentComponent } from './AddCreditsPaymentComponent';

type AddCreditsModalProps = {
  closeAction: () => void;
  resourceId?: string;
};

// TODO: refactor this when we have multiple plans.
const nrOfCredits = 500;

const WrapperAddCreditsModal: React.FC<AddCreditsModalProps> = ({
  closeAction,
}) => {
  const { notebook } = useRouteParams(notebooks({}).notebook);
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebook.id },
  });
  const workspaceId = meta.data?.getPadById?.workspace?.id ?? '';

  return (
    <AddCreditsPaymentComponent
      resourceId={workspaceId}
      closeAction={closeAction}
      nrOfCredits={nrOfCredits}
    />
  );
};

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  closeAction,
  resourceId,
}) => {
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY || '');

  return (
    <ClosableModal
      title="Add AI Credits"
      Heading="h2"
      closeAction={closeAction}
    >
      <ModalWrapper>
        <ModalSubtitle>
          <p>{nrOfCredits} Credits</p>
          <p>$15</p>
        </ModalSubtitle>
        <p css={p14Regular}>Add 500 credits to your workspace</p>
      </ModalWrapper>
      <StripeWrapper>
        <Elements stripe={stripePromise}>
          {resourceId && (
            <AddCreditsPaymentComponent
              resourceId={resourceId}
              closeAction={closeAction}
              nrOfCredits={nrOfCredits}
            />
          )}
          {!resourceId && <WrapperAddCreditsModal closeAction={closeAction} />}
        </Elements>
      </StripeWrapper>
    </ClosableModal>
  );
};

const ModalSubtitle = styled.div(p18Medium, {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const ModalWrapper = styled.div({
  borderRadius: '12px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  padding: '20px',
});

const StripeWrapper = styled.div({
  marginTop: '16px',
});
