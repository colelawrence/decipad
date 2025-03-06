import { FC, FormEvent, PropsWithChildren, useCallback } from 'react';
import { css } from '@emotion/react';
import Form from '@rjsf/core';
import { RJSFValidationError } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { cssVar, p13Medium } from '../../../primitives';

export interface JSONSchemaFormProps {
  readonly schema: object;
  readonly initialData?: object;
  readonly onSubmit: (data: unknown) => void;
  readonly onError?: (errors: Array<RJSFValidationError>) => void;
}

const inputStyles = css(p13Medium, {
  ':focus-within': {},
  border: `1px solid ${cssVar('borderSubdued')}`,
  background: cssVar('backgroundMain'),
  borderRadius: '6px',
  padding: '6px 10px',
  width: '100%',
});

const formStyles = css({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
    '.form-group': {
      marginBottom: '0.5rem',
      label: {
        fontSize: '1rem',
        fontWeight: 'bold',
      },
      '.field-description': {
        fontSize: '0.65rem',
      },
    },
    input: inputStyles,
    select: inputStyles,
    option: inputStyles,
  },
});

export const JSONSchemaForm: FC<PropsWithChildren<JSONSchemaFormProps>> = ({
  schema,
  initialData,
  onSubmit,
  onError,
  children,
}) => {
  return (
    <div css={formStyles}>
      <Form
        schema={schema}
        formData={initialData}
        validator={validator}
        onSubmit={useCallback(
          (data: unknown, event: FormEvent<unknown>) => {
            event.preventDefault();
            event.stopPropagation();
            onSubmit(data);
          },
          [onSubmit]
        )}
        onError={onError}
        idPrefix="rjsf"
      >
        {children}
      </Form>
    </div>
  );
};
