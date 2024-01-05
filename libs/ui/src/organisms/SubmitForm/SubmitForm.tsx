import { PlateComponent, useTEditorRef } from '@decipad/editor-types';
import { exportProgramByVarname } from '@decipad/import';
import { useCallback, useState } from 'react';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import { Button, InputField } from '../../atoms';
import {
  useComputer,
  useCurrentWorkspaceStore,
  useIsEditorReadOnly,
  useNotebookId,
} from '@decipad/react-contexts';
import { BackendUrl } from '@decipad/utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { SelectInput } from '../../SelectInput';
import { Loading, Email } from '../../icons';
import { isFlagEnabled } from '@decipad/feature-flags';
import { grey200 } from '../../primitives';

const configContainerStyles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 32px',
  justifyContent: 'start',
  gridGap: '8px',
});

const Config = ({
  targetUrl,
  setTargetUrl,
  secrets,
  workspaceId,
}: {
  targetUrl: string | undefined;
  setTargetUrl: (e: string) => void;
  workspaceId: string;
  secrets: {
    id: string;
    name: string;
  }[];
}) => {
  const navigate = useNavigate();

  const onNavigateToSecrets = useCallback(() => {
    setTimeout(() => {
      navigate(workspaces({}).workspace({ workspaceId }).connections({}).$, {
        replace: true,
      });
    }, 0);
  }, [navigate, workspaceId]);

  return (
    <div css={configContainerStyles}>
      <SelectInput
        labelText=""
        value={targetUrl}
        setValue={(s) => {
          setTargetUrl(s);
        }}
      >
        <option value="">Choose a Target URL</option>
        {secrets.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </SelectInput>
      <Button type="secondary" onClick={onNavigateToSecrets}>
        +
      </Button>
    </div>
  );
};

const formContainerStyles = css({
  display: 'grid',
  gridTemplateColumns: '13px 1fr auto',
  alignItems: 'center',
  gap: '8px',
  borderRadius: 12,
  padding: 8,
  border: `1px solid ${grey200.rgb}`,
  borderLeftWidth: 6,
  input: {
    border: 'none',
  },
});

const documentGuestSuccessStyles = css({});
const documentGuestErrorStyles = css({});

const Form = ({
  email,
  setEmail,
  onSubmit,
  formStatus,
}: {
  email: string;
  setEmail: (e: string) => void;
  onSubmit: () => void;
  formStatus: FormStatus;
}) => {
  if (formStatus.status === 'success') {
    return <div css={documentGuestSuccessStyles}>Thank you for submitting</div>;
  }

  return (
    <>
      <div css={formContainerStyles}>
        <Email />
        <InputField
          type="email"
          size="small"
          value={email}
          placeholder="Email"
          onChange={setEmail}
        />
        {formStatus.status === 'loading' ? (
          <Loading />
        ) : (
          <Button onClick={onSubmit}>Submit</Button>
        )}
      </div>
      {formStatus.status === 'error' && (
        <div css={documentGuestErrorStyles}>
          {formStatus.error || 'An error occured.'}
        </div>
      )}
    </>
  );
};

type SubmitFormProps = PlateComponent<{
  onDrop?: any;
}>;

type FormStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

export const SubmitForm: SubmitFormProps = ({ ...props }) => {
  const { element } = props;
  const [email, setEmail] = useState('');
  const {
    workspaceInfo: { id: workspaceId },
  } = useCurrentWorkspaceStore();
  const notebookId = useNotebookId();

  const isReadOnly = useIsEditorReadOnly();

  const proxyUrl = BackendUrl.fetchProxy(notebookId).toString();

  const editor = useTEditorRef();

  const path = useNodePath(element);

  const [formStatus, setFormStatus] = useState<FormStatus>({ status: 'idle' });

  const updatePath = usePathMutatorCallback(
    editor,
    path,
    'endpointUrlSecretName',
    'submit form'
  );
  const { secrets } = useWorkspaceSecrets(workspaceId as string);
  const secret = element?.endpointUrlSecretName as string;
  const computer = useComputer();

  const handleSubmit = useCallback(async () => {
    // We don't show submit UI unless secret is present, so this should never happen.
    if (!secret) {
      console.error('Form submitted when no secret is present.');
      return;
    }

    const exportedProgram = await exportProgramByVarname(
      computer.results.value,
      computer.getSymbolDefinedInBlock.bind(computer)
    );

    if (!email) {
      setFormStatus({ status: 'error', error: 'Email is required' });
      return;
    }
    if (!email.match(/.+@.+\..+/)) {
      setFormStatus({ status: 'error', error: 'Invalid email' });
      return;
    }

    setFormStatus({ status: 'loading' });

    try {
      await fetch(proxyUrl, {
        method: 'POST',
        body: JSON.stringify({
          body: JSON.stringify({ data: exportedProgram, email }),
          isBase64Encoded: false,
          method: 'POST',
          url: `{{{secrets.${secret}}}}`,
        }),
      });
    } catch (e) {
      setFormStatus({ status: 'error', error: 'Failed to submit form.' });
      return;
    }
    setFormStatus({ status: 'success' });
  }, [email, secret, computer, proxyUrl]);

  if (!isFlagEnabled('ENABLE_SUBMIT_FORM')) {
    return null;
  }
  return (
    <div contentEditable={false}>
      {secrets !== undefined && !isReadOnly && (
        <Config
          targetUrl={element?.endpointUrlSecretName as string}
          setTargetUrl={updatePath}
          secrets={secrets}
          workspaceId={workspaceId as string}
        />
      )}
      {(element?.endpointUrlSecretName as string) && (
        <Form
          email={email}
          formStatus={formStatus}
          setEmail={setEmail}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
