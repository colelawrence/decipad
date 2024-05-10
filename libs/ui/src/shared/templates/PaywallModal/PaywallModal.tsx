import { Modal } from '../../molecules';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStripePlans } from '@decipad/react-utils';
import * as Styled from './styles';
import { useRouteParams } from 'typesafe-routes/react-router';
import { workspaces } from '@decipad/routing';
import { SubscriptionPlansList } from './SubscriptionPlansList';
import { SubscriptionPayment } from './SubscriptionPayment';
import { useClient } from 'urql';
import {
  GetStripeCheckoutSessionInfoDocument,
  GetWorkspaceByIdDocument,
  GetWorkspaceByIdQuery,
  GetWorkspaceByIdQueryVariables,
  GetWorkspacesWithSharedNotebooksDocument,
  GetWorkspacesWithSharedNotebooksQuery,
  GetWorkspacesWithSharedNotebooksQueryVariables,
} from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';
import { useUserId } from './useUserId';
import { useToast } from '@decipad/toast';
import { PaymentAnalyticsProps, getLatestWorkspace } from './helpers';
import { useAiUsage } from '@decipad/react-contexts';
import { getAnalytics } from '@decipad/client-events';
import { useNavigate } from 'react-router-dom';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  workspaceId: string;
  hasFreeWorkspaceSlot: boolean;
  currentPlan?: string;
  onClose: () => void;
};

const DEFAULT_SELECTED_PLAN = 'personal';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  workspaceId,
  hasFreeWorkspaceSlot,
  currentPlan,
}) => {
  const params = useRouteParams(
    workspaces({}).workspace({ workspaceId }).upgrade
  );
  const isCreatingNewWorkspace = !!params.newWorkspace;

  const hideFreePlan = !hasFreeWorkspaceSlot && isCreatingNewWorkspace;
  let modalContent: JSX.Element;
  let paywallTitle: string;

  const plans = useStripePlans();

  const filteredPlans = useMemo(() => {
    return hideFreePlan ? plans.filter((plan) => plan?.key !== 'free') : plans;
  }, [hideFreePlan, plans]);

  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SELECTED_PLAN);

  const client = useClient();

  const toast = useToast();
  const { tokensQuotaLimit, increaseQuotaLimit } = useAiUsage();
  const navigate = useNavigate();
  const userId = useUserId();
  const [currentStage, setCurrentStage] = useState('choose-plan');
  const [clientSecret, setClientSecret] = useState('');

  const isFetching = useRef(false);

  const [paymentStatus, setPaymentStatus] = useState('');
  const [isPollingData, setIsPollingData] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  const trackAnalytics = useCallback(
    ({ planName, planKey }: PaymentAnalyticsProps) => {
      if (paymentStatus === 'success') {
        getAnalytics().then((analytics) =>
          analytics?.track('Purchase', {
            category: 'Subscription',
            subCategory: 'Plan',
            resource: {
              type: 'workspace',
              id: workspaceId,
            },
            plan: planName,
          })
        );
      } else {
        getAnalytics().then((analytics) =>
          analytics?.track('Purchase', {
            category: 'Subscription',
            subCategory: 'Plan',
            resource: {
              type: 'workspace',
              id: workspaceId,
            },
            plan: planName,
            error: {
              code: 'Stripe checkout error',
              message: `Check error message on Stripe dashboard for plan: ${planKey}`,
            },
          })
        );
      }
    },
    [paymentStatus, workspaceId]
  );

  const selectPlanInfo = useMemo(() => {
    return getDefined(plans.find((p) => p?.key === selectedPlan));
  }, [selectedPlan, plans]);

  const updateAiCredits = useCallback(() => {
    const aiCreditsPlan = selectPlanInfo.credits ?? 0;
    if ((tokensQuotaLimit || 0) < aiCreditsPlan) {
      increaseQuotaLimit(aiCreditsPlan);
    }
  }, [increaseQuotaLimit, selectPlanInfo.credits, tokensQuotaLimit]);

  const fetchBillingInfo = async (pId: string, resourceId: string) => {
    try {
      await client
        .query(GetStripeCheckoutSessionInfoDocument, {
          priceId: pId,
          workspaceId: resourceId,
        })
        .toPromise()
        .then((result) => {
          setClientSecret(
            result.data?.getStripeCheckoutSessionInfo?.clientSecret || ''
          );
          setCurrentStage('make-payment');
        });
    } catch (error) {
      console.error('Error fetching billing info:', error);
    }
  };

  const canProceed = useMemo(() => {
    if (isCreatingNewWorkspace) {
      return selectedPlan !== undefined;
    }
    return selectedPlan !== currentPlan && selectedPlan !== undefined;
  }, [selectedPlan, currentPlan, isCreatingNewWorkspace]);

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
        updateAiCredits();
        trackAnalytics({
          planKey: selectPlanInfo.key,
          planName: selectPlanInfo.title || '',
        });
        const wsId = getLatestWorkspace(data?.workspaces ?? []);
        navigate(workspaces({}).workspace({ workspaceId: wsId }).$);
      });
  }, [
    client,
    selectPlanInfo.key,
    selectPlanInfo.title,
    navigate,
    trackAnalytics,
    updateAiCredits,
  ]);

  const onExecuteGetWSByIdQuery = useCallback(() => {
    if (isFetching.current) {
      return;
    }

    isFetching.current = true;

    client
      .query<GetWorkspaceByIdQuery, GetWorkspaceByIdQueryVariables>(
        GetWorkspaceByIdDocument,
        { workspaceId },
        { requestPolicy: 'network-only' }
      )
      .toPromise()
      .then(({ data }) => {
        isFetching.current = false;

        if (data?.getWorkspaceById?.plan !== currentPlan) {
          toast.success(`Workspace upgraded to ${selectPlanInfo.title} plan`);
          updateAiCredits();
          trackAnalytics({
            planKey: selectPlanInfo.key,
            planName: selectPlanInfo.title || '',
          });
        }
      });
  }, [
    client,
    currentPlan,
    workspaceId,
    toast,
    selectPlanInfo.key,
    selectPlanInfo.title,
    trackAnalytics,
    updateAiCredits,
  ]);

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
          if (isCreatingNewWorkspace) {
            onExecuteGetWSNoNotebooksQuery();
          } else {
            onExecuteGetWSByIdQuery();
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
    isCreatingNewWorkspace,
    isPollingData,
    intervalId,
    onExecuteGetWSByIdQuery,
    onExecuteGetWSNoNotebooksQuery,
  ]);

  const onConfirmPayment = (_paymentStatus: string) => {
    setPaymentStatus(_paymentStatus);
    setIsPollingData(true);
  };

  switch (currentStage) {
    case 'choose-plan': {
      modalContent = (
        <SubscriptionPlansList
          plans={filteredPlans}
          isCreatingNewWorkspace={isCreatingNewWorkspace}
          hasFreeWorkspaceSlot={hasFreeWorkspaceSlot}
          setSelectedPlan={setSelectedPlan}
          selectedPlan={selectedPlan}
          currentPlan={currentPlan}
          handleBillingButton={() => {
            if (selectPlanInfo?.id) {
              fetchBillingInfo(
                selectPlanInfo?.id,
                isCreatingNewWorkspace ? userId : workspaceId
              );
            }
          }}
          handleBackButton={onClose}
          canProceed={canProceed}
          workspaceId={workspaceId}
        />
      );
      paywallTitle = `Choose a plan ${
        isCreatingNewWorkspace ? 'for your new workspace' : ''
      }`;
      break;
    }
    case 'make-payment': {
      modalContent = selectPlanInfo ? (
        <SubscriptionPayment
          handlePaymentButton={onConfirmPayment}
          clientSecret={clientSecret}
        />
      ) : (
        <></>
      );
      paywallTitle = `Upgrade to ${selectPlanInfo?.title}`;
      break;
    }
    default: {
      modalContent = <></>;
      paywallTitle = '';
    }
  }

  return (
    <Modal
      defaultOpen={true}
      onClose={onClose}
      title={paywallTitle}
      stickyToTopProps={{
        top: '15%',
        transform: 'translate(-50%, 0)',
      }}
    >
      <Styled.PaywallContainer>{modalContent}</Styled.PaywallContainer>
    </Modal>
  );
};
