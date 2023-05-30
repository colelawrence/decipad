import { runCode } from './run';

describe('Contracts to be upheld', () => {
  it('Assert a condition that is false', async () => {
    await expect(async () => runCode(`assert(1==2)`)).rejects.toThrow(
      'User defined pre-condition was not met'
    );
  });
});
