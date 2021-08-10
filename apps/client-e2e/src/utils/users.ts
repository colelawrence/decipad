import { users } from '@decipad/services';
import { UserInput } from '@decipad/backendtypes';

export async function newRandomUser() {
  const userInput: UserInput = {
    name: 'John Doe',
    email: randomEmail(),
  };

  return await users.create(userInput);
}

function randomEmail() {
  return `${randomNumber()}-${Date.now()}@decipadusers.test`;
}

function randomNumber(max = 100000) {
  return Math.round(Math.random() * max);
}
