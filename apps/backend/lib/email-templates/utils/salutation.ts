export default function salutation(user: User) {
  if (!user.name) {
    return 'Hi,';
  }
  return `Dear ${user.name}`;
};
