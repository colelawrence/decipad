// eslint-disable-next-line no-restricted-imports
import { getComputer, getExprRef } from '@decipad/computer';
import { inferNumber } from './inferNumber';
import { getIdentifiedBlocks } from '../../computer/src/testUtils';

describe('infer number with expression ref', () => {
  it('parses type as number', async () => {
    const computer = getComputer();
    const program = getIdentifiedBlocks('x = 5');
    const [id1] = program.map((p) => p.id);

    await computer.computeDeltaRequest({
      program: {
        upsert: program,
      },
    });

    await expect(inferNumber(computer, getExprRef(id1))).resolves.toMatchObject(
      {
        type: {
          kind: 'number',
          unit: null,
        },
      }
    );
  });
});
