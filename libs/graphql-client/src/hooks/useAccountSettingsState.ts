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
      const data = await updateUser({
        props: { name: newName },
      });
      setIsSubmitting(false);

      const updateSuccessful = data?.updateSelf;

      if (updateSuccessful) {
        toast.success(`Your name changed to ${newName}`);
      } else {
        toast.error('Could not change your name');
      }

      return !!updateSuccessful;
    },
    [toast, updateUser]
  );

  const setUsername = useCallback(
    async (newUsername: string) => {
      setIsSubmitting(true);
      const data = await setUsernameMutation({
        props: { username: newUsername.toLowerCase() },
      });
      setIsSubmitting(false);

      const updateSuccessful = data?.setUsername;
      if (updateSuccessful) {
        toast.success(`You are now ${newUsername}`);
      } else {
        toast.error(`Username ${newUsername} is invalid or already taken`);
      }

      return !!updateSuccessful;
    },
    [toast, setUsernameMutation]
  );

  const setDescription = useCallback(
    async (newDescription: string) => {
      setIsSubmitting(true);
      const data = await updateUser({
        props: { description: newDescription },
      });
      setIsSubmitting(false);

      const updateSuccessful = data?.updateSelf;
      if (updateSuccessful) {
        toast.success('Your bio has been updated');
      } else {
        toast.error('Could not update your bio');
      }

      return !!updateSuccessful;
    },
    [toast, updateUser]
  );

  return { isSubmitting, currentUser, setName, setUsername, setDescription };
};
