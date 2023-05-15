import { useEffect, useRef, useState } from 'react';
import { useSelected } from 'slate-react';

const wasSelectedDelayMs = 500;

export const useWasSelected = (): boolean => {
  const selected = useSelected();
  const beforeSelected = useRef(selected);

  const [wasSelected, setWasSelected] = useState(false);

  useEffect(() => {
    if (beforeSelected.current && !selected) {
      setTimeout(() => setWasSelected(true), wasSelectedDelayMs);
    } else if (wasSelected && selected) {
      setWasSelected(false);
    }
    beforeSelected.current = selected;
  }, [selected, wasSelected]);

  return wasSelected;
};
