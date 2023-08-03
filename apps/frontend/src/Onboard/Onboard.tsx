import { ClientEventsContext } from '@decipad/client-events';
import {
  useSetUsernameMutation,
  useUpdateUserMutation,
  useUserQuery,
} from '@decipad/graphql-client';
import { onboard } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  AccountSetupFlow1,
  AccountSetupFlow2,
  AccountSetupFlow3,
  ErrorPage,
} from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { useCallback, useContext, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { LazyRoute } from '../meta';
import { PreOnboardingPath } from './RequireOnboard';
import { useRequiresOnboarding } from './useRequiresOnboarding';

export const Onboard = () => {
  const navigate = useNavigate();
  const session = useSession();
  const toast = useToast();

  const [userResult] = useUserQuery();

  const updateUser = useUpdateUserMutation()[1];
  const updateUsername = useSetUsernameMutation()[1];

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep retrieved values as local state so they can be edited and submitted
  // only when navigating to the next step.
  const [name, setName] = useState(() => {
    const userEmail = session.data?.user?.email;
    const fullName = userResult.data?.self?.name;
    const hasValidName = fullName && fullName !== userEmail;

    return hasValidName ? fullName : '';
  });

  const [username, setUsername] = useState(session?.data?.user?.username ?? '');

  const [description, setDescription] = useState(
    userResult.data?.self?.description ?? ''
  );

  // Browser navigation between steps.
  const step = useParams()['*'];
  const clientEvent = useContext(ClientEventsContext);
  const next = useCallback(() => {
    navigate(onboard({}).step({ step: Number(step) + 1 }).$);
    clientEvent({
      type: 'action',
      action: 'onboarding screen',
      props: {
        screen: `Screen ${Number(step)} finished`,
      },
    });
  }, [navigate, step, clientEvent]);
  const previous = useCallback(() => {
    navigate(onboard({}).step({ step: Number(step) - 1 }).$);
  }, [navigate, step]);

  const requiresOnboarding = useRequiresOnboarding();
  const redirectPath = PreOnboardingPath.value;

  if (!requiresOnboarding) {
    return <Navigate replace to={redirectPath} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LazyRoute>
            <Navigate replace to={onboard({}).step({ step: 1 }).$} />
          </LazyRoute>
        }
      />
      <Route
        path="/1"
        element={
          <LazyRoute>
            <AccountSetupFlow1 next={next} />
          </LazyRoute>
        }
      />
      <Route
        path="/2"
        element={
          <LazyRoute>
            <AccountSetupFlow2
              name={name}
              username={username}
              onChangeName={setName}
              onChangeUsername={setUsername}
              isSubmitting={isSubmitting}
              next={() => {
                setIsSubmitting(true);

                Promise.allSettled([
                  updateUser({ props: { name } }),
                  updateUsername({
                    props: { username: username.toLowerCase() },
                  }),
                ])
                  .then(([userUpdate, usernameUpdate]) => {
                    if (
                      userUpdate.status === 'rejected' ||
                      (userUpdate.status === 'fulfilled' &&
                        userUpdate.value.error)
                    ) {
                      const error =
                        userUpdate.status === 'rejected'
                          ? userUpdate.reason
                          : userUpdate.value.error;
                      console.error('Failed to update name. Error:', error);
                      toast('Could not change your name', 'error');
                    } else if (
                      usernameUpdate.status === 'fulfilled' &&
                      username.trim() !== '' &&
                      usernameUpdate.value?.data?.setUsername !== true
                    ) {
                      toast(
                        'That username is already taken, please change it',
                        'error'
                      );
                    } else {
                      next();
                    }
                  })
                  .finally(() => {
                    setIsSubmitting(false);
                  });
              }}
              previous={previous}
            />
          </LazyRoute>
        }
      />
      <Route
        path="/3"
        element={
          <LazyRoute>
            <AccountSetupFlow3
              email={session.data?.user?.email}
              name={name}
              username={username}
              description={description}
              isSubmitting={isSubmitting}
              onChangeDescription={setDescription}
              finish={() => {
                setIsSubmitting(true);

                Promise.allSettled([
                  updateUser({ props: { description, onboarded: true } }),
                ])
                  .then(([result]) => {
                    if (
                      result.status === 'rejected' ||
                      (result.status === 'fulfilled' && result.value.error)
                    ) {
                      const error =
                        result.status === 'rejected'
                          ? result.reason
                          : result.value.error;
                      console.error(
                        'Failed to onboard the user. Error:',
                        error
                      );
                      toast(
                        'Could not get you fully onboarded for now',
                        'error'
                      );
                    } else {
                      navigate(redirectPath);
                      clientEvent({
                        type: 'action',
                        action: 'onboarding screen',
                        props: {
                          screen: `Screen 3 finished`,
                        },
                      });
                    }
                  })
                  .finally(() => {
                    setIsSubmitting(false);
                  });
              }}
              previous={previous}
            />
          </LazyRoute>
        }
      />
      <Route path="*" element={<ErrorPage Heading="h1" wellKnown="404" />} />
    </Routes>
  );
};
