import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { identity } from '@decipad/utils';
import { InputField, InputFieldHorizontal } from '@decipad/ui';
import { useStableCallback } from '@decipad/react-utils';
import { ProxyFieldProps } from './types';

/**
 * Certain element properties are slow to update, and may be normalized when
 * they finally do update. The simplest solution is to mimic the pattern used
 * by macOS Numbers' sidebar and only update the property when the text field
 * is blurred.
 *
 * When the text field is focused, the current value is copied into a buffer.
 * Editing the text field modifies this buffer without changing the actual
 * value. When the text field is blurred, the contents of the buffer are written to
 * the element property.
 *
 * For a period of up to 500ms after the text field is blurred, the text field
 * shows the value of the buffer instead of the actual value. This is to ensure
 * that the text field does not flicker between the new value and the old value
 * while the property is being updated. This grace period ends early if the
 * property value changes before 500ms have elapsed.
 */
export const useWriteOnBlur = <T,>(
  value: T,
  setValueProp: (value: T) => void
) => {
  const setValue = useStableCallback(setValueProp);

  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const gracePeriodTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);

  const onFocus = useCallback(() => {
    setLocalValue(value);
    setIsFocused(true);
    clearTimeout(gracePeriodTimeout.current ?? undefined);
  }, [value]);

  const onSubmit = useCallback(() => {
    if (localValue !== value) {
      setValue(localValue);
    }
  }, [value, localValue, setValue]);

  const onBlur = useCallback(() => {
    onSubmit();
    setIsFocused(false);
    setIsInGracePeriod(true);

    gracePeriodTimeout.current = setTimeout(() => {
      setIsInGracePeriod(false);
    }, 500);
  }, [onSubmit]);

  // End grace period early if the value changes
  useLayoutEffect(() => {
    setIsInGracePeriod(false);
    clearTimeout(gracePeriodTimeout.current ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [
    isFocused || isInGracePeriod ? localValue : value,
    setLocalValue,
    { onFocus, onBlur, onSubmit },
  ] as const;
};

export interface ProxyStringFieldProps extends ProxyFieldProps<string> {
  as?: typeof InputField | typeof InputFieldHorizontal;
  error?: string;
  disabled?: boolean;
  normalizeValue?: (value: string) => string;
}

export const ProxyStringField = ({
  editor,
  as: Component = InputField,
  label,
  property,
  onChange,
  normalizeValue = identity,
  disabled,
  error,
}: ProxyStringFieldProps) => {
  const varies = property === 'varies';

  const [value, setValue, { onFocus, onBlur, onSubmit }] = useWriteOnBlur(
    varies ? '' : property.value,
    (newValue) => onChange(editor, newValue)
  );

  return (
    <Component
      type="text"
      size="small"
      label={label}
      value={value}
      error={error}
      placeholder={varies ? 'Multiple' : ''}
      disabled={disabled}
      onChange={(newValue) => setValue(normalizeValue(newValue))}
      onFocus={onFocus}
      onBlur={onBlur}
      onEnter={onSubmit}
    />
  );
};
