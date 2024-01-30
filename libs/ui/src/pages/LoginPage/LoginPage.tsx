import { css } from '@emotion/react';
import {
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { Button, InputField } from '../../shared';
import { AuthContent, SignUpConditionsContent, LoginBox } from '../../modules';
import { InvitationMessage } from './InvitationMessage.private';

const formStyle = css({
  justifySelf: 'stretch',

  display: 'grid',
  gridGap: '16px',
});

const useParameter = (name: string) => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  return params.get(name);
};

const LoginForm = ({ email: initialEmail, onSubmit }: LoginPageProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formValid, setFormValid] = useState(formRef.current?.checkValidity());
  const [email, setEmail] = useState(initialEmail ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUpEmail = useParameter('email');
  const signUpMessage = useParameter('message');
  const signUpRedirect = useParameter('redirect');

  useEffect(() => {
    if (formRef.current) {
      setFormValid(formRef.current.checkValidity());
    }
  }, [email]);

  const onChangeEmail = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (signUpRedirect) {
        window.location.href = signUpRedirect;
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(email);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, signUpRedirect, onSubmit]
  );

  useEffect(() => {
    if (signUpEmail) onChangeEmail(signUpEmail);
  }, [signUpEmail]);

  return (
    <>
      <form ref={formRef} css={formStyle} onSubmit={handleSubmit}>
        {signUpMessage && <InvitationMessage children={signUpMessage} />}
        <InputField
          autoFocus
          size="small"
          placeholder="Enter your email"
          type="email"
          required
          value={signUpEmail || email}
          disabled={Boolean(signUpEmail)}
          onChange={onChangeEmail}
        />
        <Button
          submit
          type="primary"
          disabled={!signUpRedirect && (!formValid || isSubmitting)}
          testId="login-button"
        >
          Continue
        </Button>
      </form>
      <SignUpConditionsContent />
    </>
  );
};

export interface LoginPageProps {
  email?: string | null;
  onSubmit: (email: string) => void | Promise<void>;
}

export const LoginPage = (props: LoginPageProps): ReturnType<FC> => {
  return (
    <LoginBox>
      <AuthContent title="Welcome to Decipad!" />
      <LoginForm {...props} />
    </LoginBox>
  );
};
