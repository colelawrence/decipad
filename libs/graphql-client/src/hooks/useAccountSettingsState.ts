/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { useToast } from '@decipad/toast';
import { useAuthenticationState } from './useAuthenticationState';
import { useUpdateUserMutation, useSetUsernameMutation } from '..';
import { useMutationResultHandler } from '../utils/useMutationResultHandler';

export const useAccountSettingsState = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuthenticationState();

  const updateUser = useMutationResultHandler(
    useUpdateUserMutation()[1],
    'Failed to save user'
  );
  const setUsernameMutation = useMutationResultHandler(
    useSetUsernameMutation()[1],
    'Could not change your username'
  );

  const setName = useCallback(
    async (newName: string) => {
      setIsSubmitting(true);
      try {
        await updateUser({
          props: {
            name: newName,
          },
        });

        toast(`Your name changed to ${newName}`, 'success');
      } catch (err) {
        console.error('Failed to update user. Error:', err);
        toast('Could not change your name', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast, updateUser]
  );

  const setUsername = useCallback(
    async (newUsername: string) => {
      setIsSubmitting(true);
      const data = await setUsernameMutation({
        props: {
          username: newUsername,
        },
      });
      if (data) {
        const updateSuccessful = data?.setUsername;
        if (updateSuccessful) {
          toast(`You are now ${newUsername}`, 'success');
        } else {
          toast(`Username ${newUsername} is already taken`, 'error');
        }
      }
      setIsSubmitting(false);
    },
    [toast, setUsernameMutation]
  );

  const setDescription = useCallback(
    async (newDescription: string) => {
      setIsSubmitting(true);
      const data = await updateUser({
        props: {
          description: newDescription,
        },
      });

      const updateSuccessful = data?.updateSelf;
      if (updateSuccessful) {
        toast('Your bio has been updated', 'success');
      } else {
        toast('Could not update your bio', 'error');
      }

      setIsSubmitting(false);
    },
    [toast, updateUser]
  );

  return { isSubmitting, currentUser, setName, setUsername, setDescription };
};
