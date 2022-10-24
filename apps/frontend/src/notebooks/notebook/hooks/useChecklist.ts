import { dequal } from 'dequal';
import { useCallback, useEffect, useState } from 'react';
import { StarterChecklistStateChange } from '@decipad/react-contexts';
import {
  useUserQuery,
  useFulfilGoalMutation,
  useUpdateUserMutation,
} from '../../../graphql';

interface NonEditorGoals {
  shared: boolean;
}

interface ChecklistState {
  goals: string[];
  nonEditorGoals: NonEditorGoals;
  hide: boolean;
}

interface UseChecklistProps {
  isPublic: boolean;
}

interface UseChecklistValue {
  checklistState: ChecklistState;
  handleChecklistStateChange: (props: StarterChecklistStateChange) => void;
}

export const useChecklist = ({
  isPublic,
}: UseChecklistProps): UseChecklistValue => {
  const [checklistResult] = useUserQuery();

  const [, createGoal] = useFulfilGoalMutation();
  const [, updateUser] = useUpdateUserMutation();

  const getState = useCallback((): ChecklistState => {
    const checklistState = checklistResult.data?.selfFulfilledGoals;
    const checklistHide = checklistResult.data?.self?.hideChecklist;
    return {
      goals: !checklistState ? [] : checklistState,
      nonEditorGoals: {
        shared: isPublic,
      },
      hide: !!checklistHide,
    };
  }, [
    checklistResult.data?.self?.hideChecklist,
    checklistResult.data?.selfFulfilledGoals,
    isPublic,
  ]);

  const [checklistState, setChecklistState] = useState(getState);

  useEffect(() => {
    const newState = getState();
    if (!dequal(checklistState, newState)) {
      setChecklistState(newState);
    }
  }, [checklistState, getState]);

  const handleChecklistStateChange = useCallback(
    (props: StarterChecklistStateChange) => {
      if (props.type === 'newGoal') {
        createGoal({
          props: {
            goalName: props.goalName,
          },
        }).catch((err) => console.warn(err));
      } else {
        updateUser({
          props: {
            hideChecklist: true,
          },
        }).catch((err) => console.warn(err));
      }
    },
    [createGoal, updateUser]
  );

  return { checklistState, handleChecklistStateChange };
};
