import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { ElementKind } from '@decipad/editor-types';
import { ClientEvent, ClientEventsContext } from '@decipad/client-events';

// Restrict to element kinds, or a pretend "duplicate notebook" component
export type ComponentList = ElementKind | 'duplicateButton' | 'shareButton';

interface ComponentProps {
  component: ComponentList;
  id: number;
  text: string;
  state: boolean;
  type: 'creation' | 'interaction';
  parent?: ElementKind;
  variant?: string;
  elementText?: RegExp;
}

export type StarterChecklistStateChange =
  | {
      type: 'newGoal';
      goalName: string;
    }
  | {
      type: 'hide';
    };

export interface StarterChecklistType {
  items: Array<ComponentProps>;
  completed: boolean;
  hidden: boolean;
}

export type StarterChecklistActions =
  | {
      type: 'element interaction' | 'element creation';
      id: number;
    }
  | {
      type: 'hide checklist' | 'complete checklist';
    };

const reducer = (
  state: StarterChecklistType,
  action: StarterChecklistActions
): StarterChecklistType => {
  const newState = { ...state };

  let item;
  switch (action.type) {
    case 'element interaction':
      item = newState.items.find((i) => i.id === action.id);
      if (!item || item.state) return newState;
      item.state = true;
      return newState;

    case 'element creation':
      item = newState.items.find((i) => i.id === action.id);
      if (!item || item.state) return newState;
      item.state = true;
      return newState;

    case 'complete checklist':
      newState.completed = true;
      return newState;
    case 'hide checklist':
      newState.hidden = true;
      return newState;
  }
};

const initialValue: StarterChecklistType = {
  items: [
    {
      id: 1,
      component: 'exp',
      parent: 'def',
      variant: 'expression',
      text: 'Create your first input variable',
      state: false,
      type: 'interaction',
    },
    {
      id: 2,
      component: 'code_line',
      text: 'Create your first calculation',
      state: false,
      type: 'creation',
    },
    {
      id: 3,
      component: 'code_line',
      text: 'Edit the calculation',
      state: false,
      type: 'interaction',
    },
    {
      id: 4,
      component: 'shareButton',
      text: 'Share this notebook',
      state: false,
      type: 'interaction',
    },
  ],
  completed: false,
  hidden: false,
};

const StarterContext = createContext<{
  checklist: StarterChecklistType;
  hideChecklist: () => void;
}>({
  checklist: initialValue,
  hideChecklist: () => {},
});

export interface StarterChecklistInitialState {
  hide: boolean;
  goals: string[];
  nonEditorGoals: {
    shared: boolean;
  };
}

export interface StarterContextProps {
  loaded: boolean;
  children: ReactNode;
  initialState: StarterChecklistInitialState;
  onStateChange: (props: StarterChecklistStateChange) => void;
}

export const StarterChecklistContextProvider: FC<StarterContextProps> = ({
  loaded,
  children,
  initialState,
  onStateChange,
}) => {
  const [checklist, checklistDispatch] = useReducer(
    reducer,
    initialValue,
    (startingState) => {
      const newStarting = { ...startingState };
      let counter = 0;
      for (const item of Object.values(newStarting.items)) {
        if (initialState.goals.includes(item.text)) {
          item.state = true;
          counter += 1;
        }
      }

      newStarting.hidden = initialState.hide;
      if (counter === Object.keys(newStarting.items).length) {
        newStarting.completed = true;
      }
      return newStarting;
    }
  );

  useEffect(() => {
    if (initialState.nonEditorGoals.shared) {
      checklistDispatch({
        id: 4,
        type: 'element interaction',
      });
    }
  }, [initialState.nonEditorGoals]);

  const [confettiUsed, setConfettiUsed] = useState(false);

  useEffect(() => {
    if (
      !checklist.completed &&
      !checklist.hidden &&
      !confettiUsed &&
      Object.values(checklist.items).filter((i) => i.state).length ===
        Object.keys(checklist.items).length
    ) {
      confetti({
        particleCount: 150,
      });
      setConfettiUsed(true);
      checklistDispatch({ type: 'complete checklist' });
    }
  }, [checklist, confettiUsed, onStateChange]);

  const analytics = useContext(ClientEventsContext);
  const userEvents = useCallback(
    (clientEvent: ClientEvent) => {
      if (!loaded) return;

      if (clientEvent.type === 'action') {
        if (clientEvent.action === 'element interaction') {
          const item = checklist.items.find((i) => {
            // Used for widgets and such
            if (i.type !== 'interaction') return;
            if (i.parent && i.variant) {
              return (
                i.component === clientEvent.props.element &&
                i.parent === clientEvent.props.parent &&
                clientEvent.props.variant === i.variant
              );
            }
            return i.component === clientEvent.props.element;
          });
          if (!item) return;

          if (item.elementText) {
            if (item.elementText.test(clientEvent.props.text!)) {
              checklistDispatch({
                id: item.id,
                type: 'element creation',
              });
              onStateChange({
                type: 'newGoal',
                goalName: item.text,
              });
            }
          } else {
            checklistDispatch({
              id: item.id,
              type: 'element creation',
            });
            onStateChange({
              type: 'newGoal',
              goalName: item.text,
            });
          }
        } else if (clientEvent.action === 'element creation') {
          const item = checklist.items.find(
            (i) =>
              i.component === clientEvent.props.element && i.type === 'creation'
          );
          if (!item) return;

          checklistDispatch({
            id: item.id,
            type: 'element creation',
          });
          onStateChange({
            type: 'newGoal',
            goalName: item.text,
          });
        }
      }
      analytics(clientEvent);
    },
    [analytics, loaded, checklist.items, onStateChange]
  );

  const hideChecklist = useCallback(() => {
    checklistDispatch({ type: 'hide checklist' });
    onStateChange({ type: 'hide' });
  }, [onStateChange]);

  return (
    <StarterContext.Provider value={{ checklist, hideChecklist }}>
      <ClientEventsContext.Provider value={userEvents}>
        {children}
      </ClientEventsContext.Provider>
    </StarterContext.Provider>
  );
};

export const useChecklist = () => useContext(StarterContext);
