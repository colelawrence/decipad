import { User } from '@decipad/interfaces';

export default function salutation(user: User): string {
  if (!user.name) {
    return 'Hi,';
  }
  return `Dear ${user.name}`;
}
