import { identity, noop } from '@decipad/utils';
import {
  InputHTMLAttributes,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

const alwaysTrue = () => true;

interface UseSubmittableInputProps {
  readonly format?: (value: string) => string;
  readonly onChange?: (newValue: string) => void;
  readonly validate?: (value: string) => boolean;
  readonly transform?: (newValue: string) => string;
  readonly value: string;
}

export const useSubmittableInput = ({
  format = identity,
  onChange = noop,
  validate = alwaysTrue,
  transform = identity,
  value,
}: UseSubmittableInputProps): Partial<
  InputHTMLAttributes<HTMLInputElement>
> => {
  const [state, setState] = useState<string | null>(null);

  // Reset our state whenever `props.value` change.
  useEffect(() => {
    setState(null);
  }, [value]);

  const submit = useCallback(() => {
    if (state == null) {
      return;
    }

    if (validate(state)) {
      onChange(transform(state));
    } else {
      onChange('');
    }

    setState(null);
  }, [onChange, transform, state, validate]);

  const displayValue = state != null ? state : format(value);

  return {
    onBlur: submit,
    onChange: useCallback((e) => {
      setState(e.target.value);
    }, []),
    onFocus: useCallback(() => {
      setState(value);
    }, [value]),
    onKeyDown: useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          submit();
        }
      },
      [submit]
    ),
    value: displayValue,
  };
};
