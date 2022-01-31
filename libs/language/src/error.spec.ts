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

describe('Error messages are intuitive for users', () => {
  it('Cannot convert units that have nothing to do with each other', async () => {
    await expect(() => runCode(`1 m * 1 m * 1 cm in yA`)).rejects.toThrowError(
      "Don't know how to convert between units m³ and 1.0000000000000001e-24A"
    );
  });
});

describe('Contracts to be uphelp', () => {
  it('Assert a condition that is false', async () => {
    await expect(() => runCode(`assert(1==2)`)).rejects.toThrowError(
      'User defined pre-condition was not met'
    );
  });
});
