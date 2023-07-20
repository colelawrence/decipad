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
import { Button, InputField } from '../../atoms';
import { AuthContent, SignUpConditionsContent } from '../../molecules';
import { LoginBox } from '../../organisms/LoginBox/LoginBox';
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

const LoginForm = ({ onSubmit }: LoginPageProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formValid, setFormValid] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUpEmail = useParameter('email');
  const signUpMessage = useParameter('message');
  const signUpRedirect = useParameter('redirect');

  const onChangeEmail = (newEmail: string) => {
    setEmail(newEmail);

    // ref must be set here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setFormValid(formRef.current!.checkValidity());
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
          type="primaryBrand"
          disabled={!signUpRedirect && (!formValid || isSubmitting)}
        >
          Continue
        </Button>
      </form>
      <SignUpConditionsContent />
    </>
  );
};

export interface LoginPageProps {
  onSubmit: (email: string) => void | Promise<void>;
}

export const LoginPage = ({ onSubmit }: LoginPageProps): ReturnType<FC> => {
  return (
    <LoginBox>
      <AuthContent title="Welcome to Decipad!" />
      <LoginForm onSubmit={onSubmit} />
    </LoginBox>
  );
};
