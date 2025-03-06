import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Styled from './styles';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '@decipad/client-env';
import { analytics } from '@decipad/client-events';
import {
  useCurrentWorkspaceStore,
  useResourceUsage,
} from '@decipad/react-contexts';
import { useNavigate, useParams } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { getLatestWorkspace } from './helpers';
import { useClient } from 'urql';
import {
  GetWorkspaceByIdDocument,
  GetWorkspaceByIdQuery,
  GetWorkspaceByIdQueryVariables,
  GetWorkspacesWithSharedNotebooksDocument,
  GetWorkspacesWithSharedNotebooksQuery,
  GetWorkspacesWithSharedNotebooksQueryVariables,
} from '@decipad/graphql-client';

export const SubscriptionPayment: FC = () => {
  const { cs, workspaceId, newWorkspace } = useParams();
  const navigate = useNavigate();
  const { setIsUpgradeWorkspaceModalOpen, workspaceInfo } =
    useCurrentWorkspaceStore();
  const { ai } = useResourceUsage();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [isPollingData, setIsPollingData] = useState(false);
  const isFetching = useRef(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const client = useClient();

  const stripePromise = loadStripe(env.VITE_STRIPE_API_KEY);

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

  const onExecuteGetWSNoNotebooksQuery = useCallback(() => {
    if (isFetching.current) {
      return;
    }

    isFetching.current = true;

    client
      .query<
        GetWorkspacesWithSharedNotebooksQuery,
        GetWorkspacesWithSharedNotebooksQueryVariables
      >(
        GetWorkspacesWithSharedNotebooksDocument,
        {},
        { requestPolicy: 'network-only' }
      )
      .toPromise()
      .then(({ data }) => {
        isFetching.current = false;
        const wsId = getLatestWorkspace(data?.workspaces ?? []);
        navigate(workspaces({}).workspace({ workspaceId: wsId }).$);
      });
  }, [client, navigate]);

  const onExecuteGetWSByIdQuery = useCallback(() => {
    if (isFetching.current) {
      return;
    }

    isFetching.current = true;
    const wsId: string = workspaceId || '';

    client
      .query<GetWorkspaceByIdQuery, GetWorkspaceByIdQueryVariables>(
        GetWorkspaceByIdDocument,
        { workspaceId: wsId },
        { requestPolicy: 'network-only' }
      )
      .toPromise()
      .then(({ data }) => {
        isFetching.current = false;
        const workspace = data?.getWorkspaceById;

        if (
          workspace?.workspaceSubscription?.credits &&
          workspace?.plan !== workspaceInfo.plan
        ) {
          ai.increaseQuotaLimit(workspace?.workspaceSubscription?.credits);
        }
      });
  }, [client, workspaceId, ai, workspaceInfo.plan]);

  useEffect(() => {
    if (!isPollingData) {
      if (intervalId != null) {
        clearInterval(intervalId);
      }
      return;
    }

    if (!intervalId) {
      setIntervalId(
        setInterval(() => {
          if (newWorkspace) {
            onExecuteGetWSNoNotebooksQuery();
          } else {
            onExecuteGetWSByIdQuery();
            navigate(-1);
          }
        }, 2000)
      );
    }

    return () => {
      if (intervalId != null) {
        clearInterval(intervalId);
      }
    };
  }, [
    newWorkspace,
    isPollingData,
    intervalId,
    onExecuteGetWSNoNotebooksQuery,
    navigate,
    onExecuteGetWSByIdQuery,
  ]);

  const stripeOptions = useMemo(
    () => ({
      clientSecret: cs,
      onComplete: () => {
        setShouldNavigate(true);
      },
    }),
    [cs]
  );

  useEffect(() => {
    if (shouldNavigate) {
      setIsPollingData(true);
    }
  }, [shouldNavigate, newWorkspace, workspaceId, navigate]);

  return (
    <Styled.PaymentFormWrapper>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={stripeOptions}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </Styled.PaymentFormWrapper>
  );
};
