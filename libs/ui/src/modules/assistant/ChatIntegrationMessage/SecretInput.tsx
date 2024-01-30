import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { cssVar } from '../../../primitives';
import { Button } from '../../../shared';
import { useCallback } from 'react';

const hoveredStyles = css({
  backgroundColor: cssVar('backgroundHeavy'),
});

const envVarContainerStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr 32px',
  gap: 8,
});

const selectStyles = css({
  color: cssVar('textDefault'),
  background: 'none',
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '6px',
  paddingLeft: '10px',
  paddingRight: '10px',
  height: '32px',
  ':hover': { ...hoveredStyles },
  '*::placeholder': {
    opacity: 0.5,
  },
});
type SecretInputProps = {
  readonly envVar: string;
  readonly value: string;
  readonly setValue: (envVar: string) => void;
  readonly secrets: string[];
  readonly workspaceId: string;
};

export const SecretInput = ({
  envVar,
  value,
  setValue,
  secrets,
  workspaceId,
}: SecretInputProps) => {
  const navigate = useNavigate();

  const onNavigateToSecrets = useCallback(() => {
    setTimeout(() => {
      navigate(workspaces({}).workspace({ workspaceId }).connections({}).$, {
        replace: true,
      });
    }, 0);
  }, [navigate, workspaceId]);
  return (
    <>
      <label>{envVar}</label>
      <div css={envVarContainerStyles}>
        <select
          css={selectStyles}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        >
          <option value={undefined}></option>
          {secrets?.map((secret) => (
            <option value={secret}>{secret}</option>
          ))}
        </select>
        <Button type="secondary" onClick={onNavigateToSecrets}>
          +
        </Button>
      </div>
    </>
  );
};
