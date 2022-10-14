import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { ElementKind } from '@decipad/editor-types';
import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import { cloneDeep } from 'lodash';
import { noop } from '@decipad/utils';

// Restrict to element kinds, or a pretend "duplicate notebook" component
export type ComponentList = ElementKind | 'duplicateButton' | 'shareButton';
export type ChecklistGoals =
  | 'Create your first input variable'
  | 'Create your first calculation'
  | 'Edit the calculation'
  | 'Duplicate this notebook'
  | 'Share this notebook'
  | 'Hide checklist';

interface ComponentProps {
  component: ComponentList;
  text: ChecklistGoals;
  state: boolean;
  type: 'creation' | 'interaction';
  parent?: ElementKind;
  variant?: string;
}

export type StarterChecklistStateChange =
  | {
      type: 'newGoal';
      goalName: ChecklistGoals;
    }
  | {
      type: 'hide';
    };

export interface StarterChecklistType {
  items: Array<ComponentProps>;
  hidden: boolean;
  confettiUsed: boolean;
  onStateChange: (props: StarterChecklistStateChange) => void;
}

export type StarterChecklistActions =
  | 'creation'
  | 'interaction'
  | 'hide checklist';

const reducer = (
  state: StarterChecklistType,
  action: { type: StarterChecklistActions; goal: ChecklistGoals }
): StarterChecklistType => {
  const newState = cloneDeep(state);

  let item: ComponentProps | undefined;
  switch (action.type) {
    case 'interaction':
      item = newState.items.find((i) => i.text === action.goal);
      if (!item || item.state) return state;
      item.state = true;

      break;

    case 'creation':
      item = newState.items.find((i) => i.text === action.goal);
      if (!item || item.state) return state;
      item.state = true;
      break;

    case 'hide checklist':
      newState.hidden = true;
      break;
  }

  // If all the items are completed, use the confetti.
  if (newState.items.filter((n) => n.state).length === newState.items.length) {
    newState.confettiUsed = true;
  }
  if (item) {
    newState.onStateChange({
      type: 'newGoal',
      goalName: item.text,
    });
  }
  return newState;
};

const initialValue: StarterChecklistType = {
  items: [
    {
      component: 'exp',
      parent: 'def',
      variant: 'expression',
      text: 'Create your first input variable',
      state: false,
      type: 'interaction',
    },
    {
      component: 'code_line',
      text: 'Create your first calculation',
      state: false,
      type: 'creation',
    },
    {
      component: 'code_line',
      text: 'Edit the calculation',
      state: false,
      type: 'interaction',
    },
    {
      component: 'shareButton',
      text: 'Share this notebook',
      state: false,
      type: 'interaction',
    },
  ],
  hidden: false,
  confettiUsed: false,
  onStateChange: noop,
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
      newStarting.onStateChange = onStateChange;

      let counter = 0;
      for (const item of Object.values(newStarting.items)) {
        if (initialState.goals.includes(item.text)) {
          item.state = true;
          counter += 1;
        }
      }

      newStarting.hidden = initialState.hide;
      if (counter === newStarting.items.length) {
        newStarting.confettiUsed = true;
      }
      return newStarting;
    }
  );

  const loadedRef = useRef(loaded);
  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  // Sharing notebook comes from the topbar, which is outside the editor.
  // So I need to change that state outside of this component and then
  // pass it as initial state and listen to those changes in this useEffect.
  useEffect(() => {
    if (initialState.nonEditorGoals.shared) {
      checklistDispatch({
        type: 'interaction',
        goal: 'Share this notebook',
      });
    }
  }, [initialState.nonEditorGoals]);

  // Default to checklist confetti used, which comes from the DB.
  // if then they become different, it means the user has
  // completed the checklist.
  const confettiRef = useRef(checklist.confettiUsed);

  useEffect(() => {
    if (checklist.confettiUsed && !confettiRef.current && !checklist.hidden) {
      confetti({
        particleCount: 150,
      });
      confettiRef.current = true;
    }
  }, [checklist]);

  const analytics = useContext(ClientEventsContext);
  const userEvents = useCallback(
    (clientEvent: ClientEvent) => {
      // Send analytics to client events context above it events are not of checklist type.
      // Or the checklist isn't loaded yet.
      if (!loadedRef.current || clientEvent.type !== 'checklist') {
        analytics(clientEvent);
        return;
      }

      const item = checklist.items.find((i) => {
        if (clientEvent.props.interaction === 'interaction') {
          // Some items have duplicated.
          if (i.type !== 'interaction') return;
          // Used for widgets and such
          if (i.parent && i.variant) {
            return (
              i.component === clientEvent.props.element &&
              i.parent === clientEvent.props.parent &&
              clientEvent.props.variant === i.variant
            );
          }
          return i.component === clientEvent.props.element;
        }
        if (clientEvent.props.interaction === 'creation') {
          return (
            i.component === clientEvent.props.element && i.type === 'creation'
          );
        }
        return undefined;
      });
      if (!item) return;

      checklistDispatch({ type: item.type, goal: item.text });
    },
    [analytics, loadedRef, checklist.items]
  );

  const hideChecklist = useCallback(() => {
    checklistDispatch({ type: 'hide checklist', goal: 'Hide checklist' });
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
