import type { AnyElement, UserIconKey } from '@decipad/editor-types';
import { userIconKeys } from '@decipad/editor-types';
import { useResourceUsage, useNotebookId } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useCallback, useRef } from 'react';

type UseGeneratedNameProps = {
  element: AnyElement;
  setIcon?: (icon: UserIconKey) => void;
  setLabel: (label: string) => void;
};

type GeneratedName = {
  label: string;
  icon: UserIconKey;
};

export const useGeneratedName = ({
  element,
  setIcon,
  setLabel,
}: UseGeneratedNameProps) => {
  const notebookId = useNotebookId();
  const toast = useToast();
  const abortController = useRef(new AbortController());

  const { ai } = useResourceUsage();

  const generate = useCallback(async () => {
    const body = {
      currentName: element.children[0].text,
    };

    const response = await fetch(`/api/ai/names/${notebookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: abortController.current.signal,
    });

    if (response.status !== 200) {
      toast.error('Failed to generate a name');
      return;
    }

    const { message, usage } = await response.json();

    const { content } = message;

    ai.updateUsage(usage);

    try {
      const generated: GeneratedName = JSON.parse(content);
      const { label, icon } = generated;
      setLabel(label);
      if (userIconKeys.includes(icon) && typeof setIcon === 'function') {
        setIcon(icon);
      }
    } catch (_e) {
      toast.error('Failed to generate a name');
    }
  }, [element.children, notebookId, ai, toast, setLabel, setIcon]);

  const cancel = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, []);

  return { generate, cancel };
};
