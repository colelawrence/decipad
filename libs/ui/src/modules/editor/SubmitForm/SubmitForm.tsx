import {
  AvailableSwatchColor,
  PlateComponent,
  useMyEditorRef,
} from '@decipad/editor-types';
import { exportProgramByVarname } from '@decipad/import';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspaceSecrets } from '@decipad/graphql-client';
import {
  Button,
  IconButton,
  InputField,
  TextAndIconButton,
  SelectInput,
} from '../../../shared';
import {
  useComputer,
  useCurrentWorkspaceStore,
  useEditorStylesContext,
  useIsEditorReadOnly,
  useNotebookId,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { BackendUrl } from '@decipad/utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useNavigate } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { Close, Email, Send, Spinner } from '../../../icons';
import { isFlagEnabled } from '@decipad/feature-flags';
import { brand200, cssVar, white } from '../../../primitives';
import { ToastContextType, useToast } from '@decipad/toast';
import { wrapperStyles } from '../VariableEditor/VariableEditor';
import { swatchesThemed } from '../../../utils';
import { TElement } from '@udecode/plate-common';

const configContainerStyles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 32px',
  justifyContent: 'start',
  gridGap: '8px',
  marginBottom: 10,
  div: {
    height: `100%`,
  },
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
      <SelectInput labelText="" value={targetUrl} setValue={setTargetUrl}>
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

const baseFormContainerStyles = css({
  maxWidth: '100%',
  input: {
    border: 'none',
    ':focus': {
      background: cssVar('backgroundAccent'),
    },
  },
});

const innerFormContainerStyles = {
  margin: 8,
  display: 'grid',
  gridTemplateColumns: '13px 1fr auto',
  alignItems: 'center',
  gap: '8px',
  '> svg': {
    maxWidth: 16,
  },
};

const formContainerErrorStyles = css({
  input: {
    background: cssVar('stateDangerIconBackground'),
    color: cssVar('stateDangerIconOutline'),
    ':focus': {
      background: cssVar('stateDangerIconBackground'),
    },
    '::placeholder': {
      color: cssVar('stateDangerBackground'),
    },
  },
});

const documentGuestSuccessStyles = css({
  // spread across grid
  gridColumn: '1 / 4',
  background: brand200.rgb,
  padding: '6px 12px',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  borderRadius: 5,
  div: {
    justifySelf: 'center',
  },
  // icon button
  span: {
    padding: 0,
  },
});

const Form = ({
  email,
  setEmail,
  onSubmit,
  formStatus,
  resetForm,
  toast,
}: {
  email: string;
  setEmail: (e: string) => void;
  onSubmit: () => void;
  formStatus: FormStatus;
  resetForm: () => void;
  toast: ToastContextType;
}) => {
  const { color } = useEditorStylesContext();
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = useMemo(() => swatchesThemed(darkTheme), [darkTheme]);
  const formContainerStyles = [
    wrapperStyles(baseSwatches[color as AvailableSwatchColor].rgb),
    baseFormContainerStyles,
    formStatus.status === 'error' && formContainerErrorStyles,
  ];

  useEffect(() => {
    if (formStatus.status === 'error') {
      toast.error(formStatus.error);
    }
  }, [formStatus, toast]);

  if (formStatus.status === 'success') {
    return (
      <div css={baseFormContainerStyles}>
        <div css={documentGuestSuccessStyles}>
          <div>All done!</div>
          {
            <IconButton transparent={true} onClick={resetForm}>
              <Close />
            </IconButton>
          }
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        css={formContainerStyles}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div css={innerFormContainerStyles}>
          <Email />
          <InputField
            type="email"
            size="small"
            value={email}
            placeholder="Email"
            onChange={setEmail}
            disabled={formStatus.status === 'loading'}
          />

          <TextAndIconButton
            onClick={onSubmit}
            text="Submit"
            iconPosition="left"
            color={formStatus.status === 'loading' ? 'grey' : 'black'}
          >
            {formStatus.status === 'loading' ? (
              <Spinner />
            ) : (
              <Send fill={white.rgb} />
            )}
          </TextAndIconButton>
        </div>
      </form>
    </>
  );
};

type FormStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

export const SubmitForm: PlateComponent<{}> = ({ ...props }) => {
  const element = props.element as TElement;
  const [email, setEmail] = useState('');
  const {
    workspaceInfo: { id: workspaceId },
  } = useCurrentWorkspaceStore();
  const notebookId = useNotebookId();

  const isReadOnly = useIsEditorReadOnly();

  const proxyUrl = BackendUrl.fetchProxy(notebookId).toString();

  const editor = useMyEditorRef();

  const path = useNodePath(element as any);

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

  const toast = useToast();

  const handleSubmit = useCallback(async () => {
    if (!secret) {
      toast.error('No secret selected');
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
  }, [email, secret, computer, proxyUrl, toast]);

  const resetForm = useCallback(() => {
    setFormStatus({ status: 'idle' });
    setEmail('');
  }, [setFormStatus, setEmail]);

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
      {(secret || !isReadOnly) && (
        <Form
          email={email}
          formStatus={formStatus}
          setEmail={setEmail}
          onSubmit={handleSubmit}
          resetForm={resetForm}
          toast={toast}
        />
      )}
    </div>
  );
};
