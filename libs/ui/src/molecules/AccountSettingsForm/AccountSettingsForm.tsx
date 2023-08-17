import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { InputField, TextareaField } from '../../atoms';

type ModalFormProps = {
  currentUser: { name: string; username: string; bio: string };
};

// We don't go for community anymore and it takes too much space
const DISABLE_BIO = true;

export const AccountSettingsForm = ({
  currentUser,
}: ModalFormProps): ReturnType<React.FC> => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    setName(currentUser.name);
    setUsername(currentUser.username);
    setBio(currentUser.bio);
  }, [currentUser]);

  return (
    <div css={formWrapperStyle}>
      <InputField
        required
        size="small"
        label="Name"
        name="name"
        placeholder="Aspen Vaccaro"
        value={name}
        onChange={setName}
        testId="user-name"
      />
      <InputField
        size="small"
        label="Username"
        name="username"
        placeholder="@aspen"
        value={username}
        onChange={setUsername}
        testId="user-username"
      />
      {!DISABLE_BIO && (
        <TextareaField
          required
          label="Bio"
          name="bio"
          placeholder="I'm a passionate personal finance enthusiast with a strong background in mathematics and economics."
          value={bio}
          onChange={setBio}
        />
      )}
    </div>
  );
};

export const serializeAccountSettingsForm = (formElement: HTMLFormElement) => {
  const formData = new FormData(formElement);

  return {
    name: formData.get('name') as string,
    username: formData.get('username') as string,
    bio: formData.get('bio') as string,
  };
};

const formWrapperStyle = css({ display: 'grid', rowGap: '12px' });
