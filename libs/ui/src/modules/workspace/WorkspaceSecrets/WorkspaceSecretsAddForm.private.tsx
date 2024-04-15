import { SecretInput } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import React, { FormEvent, useCallback, useState } from 'react';
import { Check } from '../../../icons';
import { cssVar, p13Medium } from '../../../primitives';
import { Button, InputField, Loading } from '../../../shared';

type AddFormProps = {
  onAdd: (secret: SecretInput) => Promise<void>;
  webhook: boolean;
};

export const WorkspaceSecretsAddForm: React.FC<AddFormProps> = ({
  onAdd,
  webhook,
}) => {
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isDisabled =
    loading || name.trim().length < 1 || secret.trim().length < 1;

  const handleAddSecret = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      if (isDisabled) return;

      const secretName = name.replaceAll(' ', '_');

      setLoading(true);
      onAdd({ name: secretName, secret })
        .then(() => {
          setName('');
          setSecret('');
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2000);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [name, secret, isDisabled, onAdd]
  );

  return (
    <div css={formContainerStyles}>
      <div css={tableHeadStyles}>
        {webhook ? 'Configure Webhooks' : 'Manage API Secrets'}
      </div>
      <form css={secretFormStyles} onSubmit={handleAddSecret}>
        <InputField
          required
          size="full"
          testId="input-secret-name"
          placeholder="Name"
          value={name}
          onChange={setName}
        />

        <InputField
          required
          size="full"
          testId="input-secret-value"
          placeholder={webhook ? 'https://' : 'Value'}
          value={secret}
          onChange={setSecret}
        />

        <div css={addSecretButtonStyles}>
          <Button
            submit
            size="extraSlim"
            testId="add-secret-button"
            disabled={isDisabled}
          >
            <div css={addButtonContentStyles}>
              {success && <CheckMark />}
              {loading && <LoadingDots />}
              Add
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};

const CheckMark = () => <Check width="16px" style={{ marginRight: '6px' }} />;
const LoadingDots = () => (
  <Loading width="24px" style={{ marginRight: '6px' }} />
);

const formContainerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const secretFormStyles = css({
  gap: '8px',
  display: 'flex',
  flexDirection: 'row',
  input: {
    paddingTop: '7px',
    paddingBottom: '7px',
    fontSize: '13px',
    lineHeight: '100%',
    width: '100%',
  },
});

const addButtonContentStyles = css({
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
});

const tableHeadStyles = css(p13Medium, {
  color: cssVar('textDisabled'),
});

const addSecretButtonStyles = css({
  maxWidth: 'fit-content',
});
