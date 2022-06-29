import { useEffect, useState } from 'react';

type CodeLineTutorial = {
  id: string;
  tips: string;
  placeholder: string;
};

const LOCALSTORAGE_KEY = 'codeLineTutorials';
const DEFAULT_PLACEHOLDER = 'income = 1000 USD';
const TUTORIALS: CodeLineTutorial[] = [
  {
    id: 'name-a-number',
    tips: 'Pro tip: you can name a number',
    placeholder: 'Distance = 42 km',
  },
  {
    id: 'use-a-variable',
    tips: 'Pro tip: use this name in calculations',
    placeholder: 'Distance_twice = 2 * Distance',
  },
  {
    id: 'add-same-units',
    tips: 'Pro tip: you can add units of the same type',
    placeholder: 'TwoMarathons = 26 miles + 42 km',
  },
];

export const useCodeLineTutorials = (isFocused: boolean, isEmpty: boolean) => {
  const [startedEmpty, setStartedEmpty] = useState(false);
  const [tutorial, setTutorial] = useState<CodeLineTutorial | null>(null);

  // We need only initial value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setStartedEmpty(isEmpty), [setStartedEmpty]);
  useEffect(() => {
    if (!startedEmpty) return;

    const newTutorial = findNewTutorial();
    if (!newTutorial) return;

    setTutorial(newTutorial);
    saveDisplayedTutorial(newTutorial);
  }, [startedEmpty]);

  if (!tutorial) return { tips: undefined, placeholder: DEFAULT_PLACEHOLDER };
  if (!isFocused) return { tips: undefined, placeholder: tutorial.placeholder };

  return { tips: tutorial.tips, placeholder: tutorial.placeholder };
};

const findNewTutorial = () => {
  const previous = getDisplayedTutorials();
  const displayedIds = new Set(Object.keys(previous));

  return TUTORIALS.find((t) => !displayedIds.has(t.id)) || null;
};

const getDisplayedTutorials = (): Record<string, boolean> => {
  let tutorials = {};
  const tutorialsData = localStorage.getItem(LOCALSTORAGE_KEY);

  try {
    tutorials = JSON.parse(tutorialsData || '{}');
  } catch (e) {
    // do nothing
  }

  return tutorials;
};

const saveDisplayedTutorial = (tutorial: CodeLineTutorial) => {
  const tutorials = JSON.stringify({
    [tutorial.id]: true,
    ...getDisplayedTutorials(),
  });
  localStorage.setItem(LOCALSTORAGE_KEY, tutorials);
};
