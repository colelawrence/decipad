/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { useState } from 'react';
import { Button, InputField, TextareaField } from '../../atoms';

type ModalFormProps = {
  readonly onSubmit: (label: string) => void;
  readonly title: string;
  readonly label?: string;
  readonly placeholderLabel?: string;
  readonly setIsSubmitting?: (isIt: boolean) => void;
  readonly isSubmitting?: boolean;
  readonly multiline?: boolean;
};

export const ModalForm = ({
  onSubmit,
  title,
  label = '',
  placeholderLabel = 'Insert here',
  setIsSubmitting = noop,
  isSubmitting = false,
  multiline = false,
}: ModalFormProps): ReturnType<React.FC> => {
  const [newLabel, setNewLabel] = useState(label);
  const Field = multiline ? TextareaField : InputField;
  return (
    <form
      css={{ display: 'grid', rowGap: '12px' }}
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
          await onSubmit(newLabel);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <h1>{title}</h1>
      <Field
        required
        placeholder={placeholderLabel}
        value={newLabel}
        onChange={setNewLabel}
      />
      <Button
        type="secondary"
        submit
        disabled={
          !newLabel ||
          newLabel === label ||
          `@${newLabel}` === label ||
          isSubmitting
        }
      >
        Save changes
      </Button>
    </form>
  );
};
