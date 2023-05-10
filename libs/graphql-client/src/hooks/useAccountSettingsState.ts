import { useAuthenticationState } from './useAuthenticationState';

export const useAccountSettingsState = () => {
  const { currentUser } = useAuthenticationState();

  return { currentUser };
};
