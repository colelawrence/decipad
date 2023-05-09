import { runCode } from './run';

describe('Correctness of error behaviour', () => {
  it('Can error during runtime if the dimensions are wrong', async () => {
    await expect(
      runCode(`
        [ [1, 2], [3, 4], [5, 6] ] + [ [100, 300, 500], [200, 400, 600] ]
      `)
    ).rejects.toBeInstanceOf(Error);
  });
});

describe('Contracts to be upheld', () => {
  it('Assert a condition that is false', async () => {
    await expect(async () => runCode(`assert(1==2)`)).rejects.toThrow(
      'User defined pre-condition was not met'
    );
  });
});
