import { users } from '@decipad/services';
import { UserInput } from '@decipad/backendtypes';

function randomNumber(max = 100000) {
  return Math.round(Math.random() * max);
}

function randomEmail() {
  return `${randomNumber()}-${Date.now()}@decipadusers.test`;
}

export async function newRandomUser() {
  const userInput: UserInput = {
    name: 'John Doe',
    email: randomEmail(),
  };

  return users.create(userInput);
}
