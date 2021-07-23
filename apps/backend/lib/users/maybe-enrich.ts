import tables from '../tables';

export default async function maybeEnrich(
  existingUser: UserWithSecret,
  newUserProps: Partial<UserInput>
): Promise<UserWithSecret> {
  let update = false;
  const updateUser = { ...existingUser };

  if (newUserProps.name && newUserProps.name !== existingUser.name) {
    update = true;
    updateUser.name = newUserProps.name;
  }
  if (newUserProps.email && newUserProps.email !== existingUser.email) {
    update = true;
    updateUser.email = newUserProps.email;
  }
  if (newUserProps.image && newUserProps.image !== existingUser.image) {
    update = true;
    updateUser.image = newUserProps.image;
  }

  const data = await tables();

  if (update) {
    await data.users.put(updateUser);
  }

  if (newUserProps.email && newUserProps.email !== existingUser.email) {
    const emailKey = `email:${newUserProps.email}`;
    const existingEmailKey = await data.userkeys.get({ id: emailKey });
    if (!existingEmailKey) {
      const newEmailUserKey = {
        id: emailKey,
        user_id: existingUser.id,
      };
      await data.userkeys.put(newEmailUserKey);
    }
  }

  if (newUserProps.provider && newUserProps.providerId) {
    const providerKey = `${newUserProps.provider}:newUserProps.providerId`;
    const existingProviderKey = await data.userkeys.get({ id: providerKey });
    if (!existingProviderKey) {
      const newProviderUserKey = {
        id: providerKey,
        user_id: existingUser.id,
      };
      await data.userkeys.put(newProviderUserKey);
    }
  }

  return updateUser;
}
