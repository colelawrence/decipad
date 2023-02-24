import { onboard } from '@decipad/routing';
import {
  AccountSetupFlow1,
  AccountSetupFlow2,
  AccountSetupFlow3,
  ErrorPage,
} from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useToast } from '@decipad/toast';
import { isEmpty } from 'lodash';
import { LazyRoute } from '../meta';
import {
  useUpdateUserMutation,
  useSetUsernameMutation,
  useUserQuery,
} from '../graphql';
import { useRequiresOnboarding } from './useRequiresOnboarding';
import { PreOnboardingPath } from './RequireOnboard';

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
  const [username, setUsername] = useState(session.data?.user?.username ?? '');
  const [description, setDescription] = useState(
    userResult.data?.self?.description ?? ''
  );

  // Browser navigation between steps.
  const step = useParams()['*'];
  const next = useCallback(() => {
    navigate(onboard({}).step({ step: Number(step) + 1 }).$);
  }, [navigate, step]);
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
                  updateUsername({ props: { username } }),
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
                      usernameUpdate.status === 'rejected' ||
                      (usernameUpdate.status === 'fulfilled' &&
                        usernameUpdate.value.error)
                    ) {
                      const error =
                        usernameUpdate.status === 'rejected'
                          ? usernameUpdate.reason
                          : usernameUpdate.value.error;
                      console.error('Failed to update username. Error:', error);
                      toast(
                        usernameUpdate.status === 'rejected' ||
                          isEmpty(error.graphQLErrors)
                          ? 'Could not change your username'
                          : error.graphQLErrors.toString(), // this are created by us, not generic error messages.
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
