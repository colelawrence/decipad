export const isLocalhostProPlan = ({
  planName,
  isPremium,
}: {
  planName: string;
  isPremium: boolean;
}): boolean => {
  return !isPremium && planName === 'Pro';
};
