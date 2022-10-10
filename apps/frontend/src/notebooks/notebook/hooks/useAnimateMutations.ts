import { useEffect } from 'react';
import { animateMutations, stopAnimatingMutations } from './animateMutations';

export const useAnimateMutations = () => {
  useEffect(() => {
    animateMutations();
    return stopAnimatingMutations;
  }, []);
};
